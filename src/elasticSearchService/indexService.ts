import {
  ErrorDocumentsResponseCreatePostIndex,
  FieldErrorDocumentsPostIndex,
  PostInputAddIndex,
} from "./../utils/type-graphql";
import client from "../utils/elasticSearchConnect";
import { nameIndexStandardized } from "./helpers/nameIndexEL.helper";
import flatMap from "array.prototype.flatmap";
import { ElasticSync } from "../entities/ElasticSync";

export async function createIndexSearchTitlePost(
  nameIndex: string
): Promise<any> {
  let checkNameIndex = nameIndexStandardized(nameIndex);
  if (checkNameIndex === false) {
    return false;
  }

  return new Promise((resolve, reject) => {
    client.indices.create(
      {
        index: checkNameIndex as string,
        body: {
          settings: {
            index: {
              number_of_replicas: 0, // for local development
            },
            analysis: {
              filter: {
                autocomplete_filter: {
                  type: "edge_ngram",
                  min_gram: 2,
                  max_gram: 8,
                },
              },
              analyzer: {
                autocomplete: {
                  type: "custom",
                  tokenizer: "standard",
                  filter: ["lowercase", "autocomplete_filter"],
                },
                edge_ngram_analyzer: {
                  filter: ["lowercase"],
                  tokenizer: "edge_ngram_tokenizer",
                },
                edge_ngram_search_analyzer: {
                  tokenizer: "lowercase",
                },
              },
              tokenizer: {
                edge_ngram_tokenizer: {
                  type: "edge_ngram",
                  min_gram: 2,
                  max_gram: 8,
                  token_chars: ["letter"],
                },
              },
            },
          },
          mappings: {
            properties: {
              title: {
                type: "text",
                fields: {
                  edgengram: {
                    type: "text",
                    analyzer: "edge_ngram_analyzer",
                    search_analyzer: "edge_ngram_search_analyzer",
                  }, //tim kiếm theo chuỗi mà cho phép sai 1 ký tự ( tìm được trong khoảng giữa ký tự )
                  autocomplete: {
                    //tìm kiếm từ ( theo chiều đúng từ đầu tới cuối từ )
                    type: "text",
                    analyzer: "autocomplete",
                    search_analyzer: "autocomplete",
                  },
                },
                analyzer: "standard",
              },
              id: {
                type: "integer",
              },
              createdAt: {
                type: "date",
              },
              points: {
                type: "integer",
              },
              updatedAt: {
                type: "date",
              },
              text: {
                type: "text",
                fields: {
                  edgengram: {
                    type: "text",
                    analyzer: "edge_ngram_analyzer",
                    search_analyzer: "edge_ngram_search_analyzer",
                  }, //tim kiếm theo chuỗi mà cho phép sai 1 ký tự ( tìm được trong khoảng giữa ký tự )
                  autocomplete: {
                    //tìm kiếm từ ( theo chiều đúng từ đầu tới cuối từ )
                    type: "text",
                    analyzer: "autocomplete",
                    search_analyzer: "autocomplete",
                  },
                },
                analyzer: "standard",
              },
              creatorId: {
                type: "integer",
              },
            },
          },
        },
      },
      function (err, resp, status) {
        console.log("status: ", status);
        if (err) {
          console.log("err: ", err);
          console.log("err.message: ", err.message);
          if (err.message.includes("resource_already_exists_exception")) {
            return resolve(true);
          }
          return reject(false);
        } else {
          console.log("create:", resp);
          resolve(resp.acknowledged);
        }
      }
    );
  });
}

export async function CheckIndexExist(nameIndex: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    client.indices.exists(
      {
        index: nameIndex,
      },
      (err, resp, status) => {
        if (err) {
          return reject(err);
        } else if (status === 200) {
          console.log("resp:", resp);
          return resolve(true);
        } else {
          return resolve(false);
        }
      }
    );
  });
}

export async function BulkInsertDataIndexToPost(
  nameIndex: string,
  arrayPosts: PostInputAddIndex[]
): Promise<ErrorDocumentsResponseCreatePostIndex> {
  try {
    let arrayErrorDocuments: FieldErrorDocumentsPostIndex[] = [];

    if (arrayPosts.length > 0 && nameIndex) {
      //check index exist
      let resultCheckIndex = await CheckIndexExist(nameIndex);

      if (resultCheckIndex === false) {
        return {
          status: false,
        };
      }

      const body = arrayPosts.flatMap((doc) => [
        { index: { _index: nameIndex, _id: doc.id } },
        doc,
      ]);
      console.log("body: ", body);

      const bulkResponse = await client.bulk({ refresh: true, body });

      bulkResponse.items.forEach((element: any) => {
        // element:  { index:
        //   { _index: 'postindex',
        //     _type: '_doc',
        //     _id: '7',
        //     _version: 1,
        //     result: 'created',
        //     forced_refresh: true,
        //     _shards: { total: 1, successful: 1, failed: 0 },
        //     _seq_no: 9,
        //     _primary_term: 14,
        //     status: 201 } }

        const operation = Object.keys(element)[0];

        if (
          element[operation].result !== "created" &&
          element[operation].result !== "updated"
        ) {
          arrayErrorDocuments.push({
            index: element[operation]._index,
            id: element[operation]._id,
            result: element[operation].result,
            status: element[operation].status,
          });
        }
      });

      // const { count } = await client.count({ index: nameIndex });
      // console.log("count: ", count);
    }

    if (arrayErrorDocuments.length > 0) {
      let arrayToReSyncElastic: PostInputAddIndex[] = [];

      arrayErrorDocuments.forEach((item) => {
        let found = arrayPosts.find((post, index) => {
          if (post.id === +item.id) return true;
        });

        if (found) {
          arrayToReSyncElastic.push(found);
        }
      });

      //lưu vào bảng ElasticSync những object bị đồng bộ không thành công để đồng bộ lại
      await ElasticSync.create({
        nameIndex: nameIndex,
        data: arrayToReSyncElastic,
      }).save();

      return {
        errors: arrayErrorDocuments,
        status: false,
      };
    }

    return {
      status: true,
    };
  } catch (error) {
    console.log("error: ", error);
    return {
      status: false,
    };
  }
}

// export async function putSettings(nameIndex: string): Promise<any> {

//   let checkNameIndex = nameIndexStandardized(nameIndex);
//   if(checkNameIndex === false){
//     return false
//   }

//   return new Promise((resolve, reject)=>{
//      client.indices.putSettings({
//       index: checkNameIndex as string,
//       body:{
//         settings: {
//           "analysis":{
//             "filter":{
//               "autocomplete_filter":{
//                 "type": "edge_ngram",
//                 "min_gram": 2,
//                 "max_gram": 8
//               }
//             },
//             "analyzer":{
//               "autocomplete":{
//                 "type": "custom",
//                 "tokenizer": "standard",
//                 "filter": [
//                   "lowercase",
//                   "autocomplete_filter"
//                 ]
//               }
//             }
//           }
//         }
//       },
//     },
//     function (err, resp, status) {
//       console.log("status: ", status);
//       if (err) {
//         console.log('err:',typeof err);
//         console.log('err: ', err);
//         return reject(false);
//       } else {
//         console.log("create:", resp);
//         resolve(resp.acknowledged)
//       }
//     })
//   })
// }

// export async function putMapping(nameIndex: string): Promise<any> {

//   let checkNameIndex = nameIndexStandardized(nameIndex);
//   if(checkNameIndex === false){
//     return false
//   }

//   return new Promise((resolve, reject)=>{
//      client.indices.putMapping({
//       index: checkNameIndex as string,
//       type: '',
//       body:{
//         "properties": {
//           "text": {
//             "type": "text",
//             "analyzer": "autocomplete",
//             "search_analyzer": "autocomplete"
//           }
//         }
//       },
//     },
//     function (err, resp, status) {
//       console.log("status: ", status);
//       if (err) {
//         console.log('err:',typeof err);
//         console.log('err: ', err);
//         return reject(false);
//       } else {
//         console.log("create:", resp);
//         resolve(resp.acknowledged)
//       }
//     })
//   })
// }

export async function deleteIndex(nameIndex: string): Promise<any> {
  let checkNameIndex = nameIndexStandardized(nameIndex);
  if (checkNameIndex === false) {
    return false;
  }

  await client.indices.delete(
    { index: checkNameIndex },
    function (err, resp, status) {
      console.log("status: ", status);
      if (err) {
        console.log("err: ", err);
        return false;
      } else {
        return resp.acknowledged;
      }
    }
  );
}
