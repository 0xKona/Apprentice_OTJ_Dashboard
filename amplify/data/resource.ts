import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  TrainingLog: a
    .model({
      date: a.date().required(),
      startTime: a.time().required(),
      endTime: a.time().required(),
      durationHours: a.float().required(),
      activity: a.string().required(),
      newLearning: a.string().required(),
      impactOfLearning: a.string().required(),
      userId: a.string().required(),
    })
    .authorization((allow) => [
      allow.owner().to(["read", "create", "update", "delete"]),
    ]),

      
  GenerateImprovement: a.generation({
    // aiModel: a.ai.model('Claude 3.5 Haiku'),
    aiModel: {
      resourcePath: 'eu.anthropic.claude-3-haiku-20240307-v1:0'
    },
    systemPrompt: `You are a assistant that improves UK Apprentice on the job hours logs. You will be provided with a log, along with which section to improve.
    return the improved log as json`,
  })
  .arguments({
    logSectionToImprove: a.string(),
    log: a.json()
  })
  .returns(
    a.customType({
      improvedLog: a.json()
    })
  )
  .authorization((allow) => allow.authenticated()),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
