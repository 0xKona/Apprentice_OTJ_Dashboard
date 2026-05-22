# Product Overview

OTJobber is a web application for UK apprentices to manage their On-The-Job (OTJ) training logs. It allows apprentices to record, track, and export their training activities as required for apprenticeship documentation.

## Core Features

- **Training Log Management**: CRUD operations for daily training log entries (date, time, duration, activity, learning, impact)
- **AI-Powered Improvements**: Uses Amazon Bedrock (Nova Lite) to enhance training log text with professional language while maintaining the apprentice's voice
- **Bulk Ingest**: Import training logs from Excel spreadsheets
- **Export**: Export filtered training logs (by date range) for submission
- **Dashboard**: Overview with total hours, average hours, charts, and recent logs
- **Authentication**: Email-based sign-up/sign-in with Cognito user pools
- **AI Rate Limiting**: Daily usage caps on AI generation (25/day in production, 1000 in sandbox)

## Target Users

UK apprentices who need to document their on-the-job training hours and activities for their apprenticeship programme.

## Active Migration

The backend is migrating from AWS Amplify Gen 2 to standalone AWS CDK. The CDK backend (`backend/`) is the source of truth for all infrastructure. The Amplify backend (`amplify/`) is deprecated and should not receive new work.
