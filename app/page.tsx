"use client";

import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";

Amplify.configure(outputs);

export default function App() {
  return (
    <main>
      <h1 className="text-3xl font-bold underline">Test</h1>
    </main>
  );
}
