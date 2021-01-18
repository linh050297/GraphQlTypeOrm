import client from "../utils/elasticSearchConnect";
import esb from "elastic-builder";
import { Post } from "../entities";

export async function SearchPostElAutocomplete(
  searchString: string,
  index: string
): Promise<Post[] | null> {
  // Multi Match Query
  const requestBody = esb
    .requestBodySearch()
    .query(
      esb
        .multiMatchQuery(
          ["title.autocomplete^3", "text.autocomplete"],
          searchString
        )
        .operator("and")
        .type("best_fields")
        .tieBreaker(0.3)
        .fuzziness("2")
        .minimumShouldMatch("30%")
    );

  //*** best_fields - (default) Finds documents which match any field, but uses the _score from the best field. */

  const body = await client.search({
    index: index,
    body: requestBody.toJSON(),
  });

  if (body.hits.hits.length > 0) {
    let postsArr: Post[] = [];

    body.hits.hits.forEach((post) => {
      postsArr.push(post._source as Post);
    });

    console.log("postsArr: ", postsArr);
    return postsArr;
  }

  return null;
}

export async function SearchPostEdgengram(
  searchString: string,
  index: string
): Promise<Post[] | null> {
  // Multi Match Query
  const requestBody = esb
    .requestBodySearch()
    .query(
      esb
        .multiMatchQuery(["title.edgengram^3", "text.edgengram"], searchString)
        .operator("and")
        .type("most_fields")
        .fuzziness("1")
        .minimumShouldMatch("100%")
    );

  const body = await client.search({
    index: index,
    body: requestBody.toJSON(),
  });

  if (body.hits.hits.length > 0) {
    let postsArr: Post[] = [];

    body.hits.hits.forEach((post) => {
      postsArr.push(post._source as Post);
    });

    console.log("postsArr: ", postsArr);
    return postsArr;
  }

  return null;
}
