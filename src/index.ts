#!/usr/bin/env node

// import yargs from "yargs";
import express from "express";

import notion2md from "./notion2md";
import md2slides from "./md2slides";
import { getPageId } from "./utils";

// const args = yargs
// 	.scriptName("notion2slides")
// 	.usage("Usage: $0 <command> [options]")
// 	.option("url", {
// 		alias: "u",
// 		describe: "The url of the Notion page to convert",
// 		type: "string",
// 		demandOption: true,
// 	})
// 	.option("theme", {
// 		alias: "t",
// 		describe: "The theme to use for the slides",
// 		type: "string",
// 		default: "default",
// 		demandOption: false,
// 	})
// 	.help()
// 	.parseSync();

// check the env variable
const NOTION_TOKEN: string | undefined =
	"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";
if (!NOTION_TOKEN) {
	console.error("Please set the NOTION_TOKEN env variable");
	process.exit(1);
}

// get the url and extract page id from it
// const url = args.url as string;
// const pageId = getPageId(url);

// get the theme from the --theme flag
// const theme = args.theme as string;

// prepare to open the file in the browser
// const opener = require('opener');

// download the page and convert it to markdown slides
const app = express();
const port = 8080;

app.get("/", async (req: express.Request, res: express.Response) => {
	const pageId = req.query.pageId;
	const theme = req.query.theme;

	if (!pageId || !theme) {
		res.send("need pageId and theme query");
		return;
	}

	// console.log("here", url);
	// const pageId = getPageId(url as string);
	const mdString = await notion2md(pageId as string, NOTION_TOKEN);
	const htmlString = md2slides(mdString, theme as string);
	res.send(`
    <html>
    <head>
      <title>Notion to Slides</title>
      <script>
        setInterval(async () => {
          try {
            const response = await fetch('/?pageId=${pageId}&theme=${theme}');
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            const newHtmlString = await response.text();
            if (document.body.innerHTML !== newHtmlString) {
              document.body.innerHTML = newHtmlString;
              console.log('Page updated!');
            }
          } catch (error) {
            console.error('Error fetching updates:', error);
          }
        }, 5000);
      </script>
    </head>
    <body>
      ${htmlString}
    </body>
    </html>
  `);
});

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});
