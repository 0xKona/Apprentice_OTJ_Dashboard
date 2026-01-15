# LOG INGESTION PLANNING

**_ MR #3 _**

## Log Storage Planning

This document covers the plan for ingesting logs from a inputted excel file.

### Log Types

This is the structure of a log, this does not include metadata, these are the values that will be saved and imported / exported to a excel log file.

- Date
- Start Time
- End Time
- Duration Hours
- Activity (What did you do?)
- New Learning (What did you learn? Knowledge, Skills & Behaviours)
- Impact of Learning (What impact does this have on your role?)

### MR Scope

This MR will cover ingestion of logs from a excel file in the dashboard/ingest page

After this MR users will be able to view on this page:

- A drag and drop interface allowing users to upload up to 20 excel files at a time
- View the status of each logs ingestion as they are processed one by one

### How to accomplish

Please review the example_log.xlsx file in this directory. You will notice there is a lot of extra cells and data we won't need. we just need the rows of logs. I beleive this should be possible with the xlsx library. Files should be sent to a next.js api endpoint, which then processes the files. Alternatively we could use a amplify lambda / api gateway. Whichever will be more efficient and maintainable. Once parsed, each row (log entry) should be uploaded to the DB as a log and should appear in the dashboard/logs page. Users should be warned about any duplicates.
