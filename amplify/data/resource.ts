import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const prompt = 
`You are an expert assistant that improves UK Apprentice training log entries.

Your task is to rewrite the provided text with enhanced professional language while maintaining the apprentice's voice.

Some inputs may contain no existing text for the field, it may be empty, in this case you should generate the field based on the rest of the full log

IMPORTANT:
- Return ONLY the improved text (2-4 complete sentences or around 75-100 words)
- Maintain the original meaning and intent
- Use professional language suitable for UK apprenticeship documentation
- Focus on skills gained and workplace relevance
- Do NOT include any labels, formatting, or explanatory text

Example:
Input: learned about aws ec2 today
Output: This training has equipped me with essential cloud infrastructure skills that directly support my role in the DevOps team. Understanding EC2 instance management enables me to deploy and maintain production systems more effectively.`;

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
    aiModel: a.ai.model('Amazon Nova Lite'),
    systemPrompt: prompt,
  })
  .arguments({
    currentFieldContent: a.string(),  // The actual text to improve
    fieldName: a.string(),            // For context: "impactOfLearning", etc.
    fullLogContext: a.json()          // The complete log for context
  })
  .returns(
    a.string()
  )
  .authorization((allow) => allow.authenticated()),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  name: "OTJobber",
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
