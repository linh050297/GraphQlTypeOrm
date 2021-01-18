import {
  ErrorDocumentsResponseCreatePostIndex,
  FieldErrorDocumentsPostIndex,
  PostInputAddIndex,
} from "./../utils/type-graphql";
import client from "../utils/elasticSearchConnect";
import { nameIndexStandardized } from "./helpers/nameIndexEL.helper";
import flatMap from "array.prototype.flatmap";
import { ElasticSync } from "../entities/ElasticSync";
import { getConnection } from "typeorm";

//tái đồng bộ những data đã đồng bộ thất bại ***Post
export async function ResyncPostEL(): Promise<void> {
  let syncFailData = await getConnection()
    .getRepository(ElasticSync)
    .createQueryBuilder("elastic_sync")
    .where("elastic_sync.nameIndex = :nameIndex", { nameIndex: "postindex" })
    .andWhere("elastic_sync.isSync = :isSync", { isSync: false })
    .getMany();

  console.log("syncFailData: ", syncFailData);

  //   let syncFailData:  [  {
  //     id: 20,
  //     nameIndex: 'postindex',
  //     createdAt: 2021-01-08T10:21:56.984Z,
  //     data: [ [Object], [Object] ],
  //     isSync: false },
  //    {
  //     id: 21,
  //     nameIndex: 'postindex',
  //     createdAt: 2021-01-08T10:25:24.311Z,
  //     data: [ [Object], [Object] ],
  //     isSync: false } ]

  // let data:  [ { id: 4,
  //     text: 'nội dung bé Diễm',
  //     title: 'bé hêu Diễm',
  //     points: 1,
  //     createdAt: null,
  //     creatorId: 1,
  //     updatedAt: null },
  //   { id: 3,
  //     text: 'nội dung bé lợn',
  //     title: 'bé lợn',
  //     points: 1,
  //     createdAt: null,
  //     creatorId: 1,
  //     updatedAt: null } ]
  // data:  [ { id: 4,
  //     text: 'nội dung bé Diễm',
  //     title: 'bé hêu Diễm',
  //     points: 1,
  //     createdAt: null,
  //     creatorId: 1,
  //     updatedAt: null },
  //   { id: 3,
  //     text: 'nội dung bé lợn',
  //     title: 'bé lợn',
  //     points: 1,
  //     createdAt: null,
  //     creatorId: 1,
  //     updatedAt: null } ]

  if (syncFailData.length > 0) {
    for (const data of syncFailData) {
      const body = data.data.flatMap((doc) => [
        { index: { _index: data.nameIndex, _id: doc.id } },
        doc,
      ]);

      //bulk insert
      const bulkResponse = await client.bulk({ refresh: true, body });

      bulkResponse.items.forEach(async (element: any) => {
        const operation = Object.keys(element)[0];

        if (
          element[operation].result === "created" ||
          element[operation].result === "updated"
        ) {
          console.log(" data.id: ", data.id);
          await ElasticSync.update({ id: data.id }, { isSync: true });
        }
      });
    }
  }
}
