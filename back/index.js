// todo
// 

'use strict'

// requires
const puppeteer = require('puppeteer');
const params = require('./params.json');
const chalk = require('chalk');

const errors = {
    "!query": "!query: bad inputs, need [target_lead]",
    "!gsheet": "!gsheet: could not connect to google sheet"
}

// auto scroll helper
// Used for: some websites load data as you navigate, and you may need to reproduce a full “human” browsing to get the information you need.
// @param {puppeteer object} page - the page to scroll down
async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;
                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

/**
 * wait
 * @param {puppeteer object} page - the page to scroll down
 */
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * run_exit
 * @param {string} status 
 */
const run_exit = (status) => {
    console.log(chalk.yellow("exit", status));
    process.exit(status);
}

/**
 * @params (Object) req - request with query params
 * @params (Object) res - json response
 */
exports.finder = async (req, res) => {
    console.log(chalk.cyan("--- cloud function"));

    /* -------------------------------- */
    // debug
    /* -------------------------------- */
    let DEBUG;
    // DEBUG = true;
    console.log(chalk.yellow("req.method:"), JSON.stringify(req.method));
    console.log(chalk.yellow("req.params:"), JSON.stringify(req.params));
    console.log(chalk.yellow("req.query:"), JSON.stringify(req.query));
    console.log(chalk.yellow("req.body:"), JSON.stringify(req.body));
    /* -------------------------------- */

    /* -------------------------------- */
    // prepare response to send
    /* -------------------------------- */
    res.setHeader('Content-Type', 'application/json');
    let output = {
        query: {
            target_company: "",
            target_lead: ""
        },
        results: {
            company: {
                exists: false,
                linkedin_url: "",
                banner: {
                    name: "",
                    nb_followers: "",
                    link_to_employee_list: ""
                },
                about: {
                    description: "",
                    site_url: "",
                    sector: "",
                    employee_range: "",
                    employee_count: "",
                    headquarters: "",
                    type: ""
                },
                employees: {
                    hrefs: [],
                    list: []
                }
            },
            lead: {
                exists: false,
                name: "",
                linkedin_profile: ""
            }
        }
    };
    /* -------------------------------- */

    /* -------------------------------- */
    // check query string in req.query:
    // @param {string} target_company - must exist
    // @param {string} target_lead - is optional
    /* -------------------------------- */
    console.log(chalk.cyan("--- parse query params"));
    output.query.target_lead = req.query.hasOwnProperty('target_lead') ? req.query.target_lead.trim() : "na";
    if (output.query.target_lead === "na") {
        res.status(400).send({ "error": errors["!query"] });
        return;
    }
    /* -------------------------------- */

    /* -------------------------------- */
    // proxy
    /* -------------------------------- */
    // todo
    // let some_ip = '51.254.182.54:1000';
    // proxybot: "https://proxybot.io/api/v1/#KEY#?geolocation_code=mx&url=https://whatismycountry.com";
    /* -------------------------------- */

    /* -------------------------------- */
    // init Puppeteer
    /* -------------------------------- */
    // console.log(chalk.cyan("--- init puppeteer"));
    // let args = [
    //     '--disable-gpu',
    //     '--no-sandbox',
    //     // '--headless',
    //     `--proxy-server=${some_ip}`,
    //     '--disable-dev-shm-usage',
    //     '--disable-setuid-sandbox',
    //     '--no-first-run',
    //     '--no-zygote',
    //     '--proxy-bypass-list=*',
    //     '--deterministic-fetch',
    // ];
    // let browser = await puppeteer.launch({
    //     headless: false,
    //     defaultViewport: null,
    //     args: args
    // });
    // let page = await browser.newPage();
    // // console.log("default browser user agent: " + browser.userAgent());
    // await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36');
    // // console.log("new browser user agent: " + browser.userAgent());
    /* -------------------------------- */

    try {
        /* -------------------------------- */
        // init GoogleSpreadsheet to store data
        /* -------------------------------- */
        try {
            console.log(chalk.cyan("--- init gsheet"));
            const doc = new GoogleSpreadsheet(params.gsheet.id);
            await doc.useServiceAccountAuth({
                client_email: params.gsheet.client_email,
                private_key: params.gsheet.private_key,
            });
            await doc.loadInfo();
            const sheet = doc.sheetsByIndex[0];
            await sheet.loadCells('A1:A1');
            const a1 = sheet.getCell(0, 0);
            console.log("test a1.value:", a1.value);
        } catch (error) {
            console.log(chalk.red("error:", error));
            res.status(422).send({ "error": errors["!gsheet"] });
            console.log(chalk.cyan("--- ending cloud function, error"));
            return;
        }
        /* -------------------------------- */

        /* -------------------------------- */
        // abc
        /* -------------------------------- */
        console.log(chalk.cyan("--- abc"));
        try {
            
        } catch (error) {
            console.log(chalk.red("error:", error));
            res.status(422).send({ "error": errors["!login"] });
            console.log(chalk.cyan("--- ending cloud function, error"));
            return;
        }
        /* -------------------------------- */

        /* -------------------------------- */
        // close Puppeteer
        /* -------------------------------- */
        console.log(chalk.cyan("--- ending cloud function, no error"));
        res.status(200).send(JSON.stringify(output)).end();
        await page.close();
        await browser.close();
        // process.exit(0);
        return;
        /* -------------------------------- */
    } catch {
        console.log(chalk.cyan("--- closing puppeteer"));
        res.status(422).send({ "error": errors["!puppeteer"] });
        await page.close();
        await browser.close();
        // process.exit(0);
        return;
    }
}