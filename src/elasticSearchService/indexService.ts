import client from "../utils/elasticSearchConnect";

export async function createIndexSearchTitlePost(nameIndex: string): Promise<any> {
  // ***nameIndex:
  // Lowercase only
  // Cannot include \, /, *, ?, ", <, >, |, ` ` (space character), ,, #
  // Indices prior to 7.0 could contain a colon (:), but that’s been deprecated and won’t be supported in 7.0+
  // Cannot start with -, _, +
  // Cannot be . or ..
  // Cannot be longer than 255 bytes (note it is bytes, so multi-byte characters will count towards the 255 limit faster)

  let regex = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

  if (regex.test(nameIndex) === true) {
    return false;
  }

  nameIndex = nameIndex.toLowerCase();

  let body = 
    {
      "settings": {
        "analysis": {
          "filter": {
            "autocomplete_filter": {
              "type": "edge_ngram",
              "min_gram": 1,
              "max_gram": 8
            }
          },
          "analyzer": {
            "autocomplete": { 
              "type": "custom",
              "tokenizer": "standard",
              "filter": [
                "lowercase",
                "autocomplete_filter"
              ]
            }
          }
        }
      },
      "mappings": {
        "properties": {
          "text": {
            "type": "text",
            "analyzer": "autocomplete", 
            "search_analyzer": "autocomplete" 
          }
        }
      }
    }


  return new Promise((resolve, reject)=>{
    client.indices.create(
      {
        index: nameIndex,
        body: {
          settings: {
            index: {
              number_of_replicas: 0 // for local development
            }
          }
        }
      },
      function (err, resp, status) {
        console.log("status: ", status);
        if (err) {
          console.log('err:',typeof err);
          console.log('err: ', err);
          return reject(false);
        } else {
          console.log("create:", resp);
          resolve(resp.acknowledged)
        }
      }
    );
  })
}

export async function deleteIndex(nameIndex: string): Promise<any> {
  // ***nameIndex:
  // Lowercase only
  // Cannot include \, /, *, ?, ", <, >, |, ` ` (space character), ,, #
  // Indices prior to 7.0 could contain a colon (:), but that’s been deprecated and won’t be supported in 7.0+
  // Cannot start with -, _, +
  // Cannot be . or ..
  // Cannot be longer than 255 bytes (note it is bytes, so multi-byte characters will count towards the 255 limit faster)

  let regex = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

  if (regex.test(nameIndex) === true) {
    return false;
  }

  nameIndex = nameIndex.toLowerCase();

  await client.indices.delete(
    { index: nameIndex },
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


