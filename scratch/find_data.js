const mongoose = require('mongoose');

const uriA = "mongodb+srv://kamblegaurav193_db_user:0112@gkblog.v1kkzsw.mongodb.net/?appName=gkblog";
const uriB = "mongodb+srv://kamblegaurav193_db_user:S8EbzphaVNtuZHIQ@cluster0.uweagbj.mongodb.net/";

const checkURI = async (name, uri) => {
  console.log(`\n--- Checking ${name} ---`);
  try {
    const conn = await mongoose.createConnection(uri).asPromise();
    console.log(`Successfully connected to ${name}`);
    
    const admin = conn.db.admin();
    const dbs = await admin.listDatabases();
    console.log(`Databases in ${name}:`, dbs.databases.map(db => db.name).join(', '));
    
    for (let dbData of dbs.databases) {
      if (['admin', 'local', 'config'].includes(dbData.name)) continue;
      
      const db = conn.useDb(dbData.name);
      const collections = await db.db.listCollections().toArray();
      const colNames = collections.map(c => c.name);
      
      if (colNames.includes('blogs')) {
        const count = await db.collection('blogs').countDocuments();
        console.log(`Found 'blogs' collection in DB '${dbData.name}' with ${count} documents.`);
      }
    }
    await conn.close();
  } catch (err) {
    console.log(`Error checking ${name}:`, err.message);
  }
};

const run = async () => {
  await checkURI("URI_A (gkblog)", uriA);
  await checkURI("URI_B (cluster0)", uriB);
  process.exit(0);
};

run();
