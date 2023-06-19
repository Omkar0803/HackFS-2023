import { Database } from "@tableland/sdk";
import { Registry } from "@tableland/sdk";
// secureStamp_314159_239;
export async function createTable(signer) {
  const db = new Database(signer);

  const { meta: userTable } = await db
    .prepare(
      `
    CREATE TABLE 
        secureStamp
    (   
       numFile INTEGER,
       cid TEXT,
       hash TEXT,
       title TEXT
    );
  `
    )
    .run();

  await console.log(userTable.txn.name);

  return userTable.txn.name;
}

export async function addCommit(tableId, signer, numFile, cId, hash, title) {
  const db = new Database(signer);
  const { meta: addCommit } = await db
    .prepare(
      `INSERT INTO secureStamp_314159_${tableId} (numFile,cid,hash,title) VALUES
    ( ?,?,?,?);
    `
    )
    .bind(numFile, cId, hash, title)
    .run();
  // Wait for transaction finality
  setTimeout(() => {
    // await addCommit.txn.wait();
    return 0;
  }, 9000);
}

export async function readTable(tableId) {
  console.log(tableId);
  const db = new Database();
  const { results } = await db
    .prepare(`SELECT * FROM secureStamp_314159_${tableId};`)
    .all();

  return results;
}

export async function readLastCommit(tableId) {
  const db = new Database();
  const { results } = await db
    .prepare(`SELECT * FROM secureStamp_314159_${tableId};`)
    .all();

  console.log(
    "lastroothash: " + results && results[0]
      ? results[results.length - 1].hash
      : results
  );
  return results && results[0] ? results[results.length - 1].hash : false;
}

export async function getTables(signer) {
  try {
    const reg = await new Registry({ signer });
    const results = await reg.listTables();
    return results && results[0].tableId ? results[0].tableId : 0;
  } catch (error) {
    return 0;
  }
  // console.log(results[0]);
}

export async function getLastCommits(commits, targetHash) {
  const targetIndex = await commits.findIndex((obj) => obj.hash === targetHash);
  if (targetIndex !== -1) {
    const targetObject = commits[targetIndex];
    const precedingObject = targetIndex > 0 ? commits[targetIndex - 1] : null;

    // console.log("Target Hash:", targetObject);
    // console.log("Preceding Hash:", precedingObject);
    return [precedingObject, targetObject];
  }
}
