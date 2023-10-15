#!/usr/bin/env node

const https = require("https");
const crypto = require("crypto");
const url = require("url");
const fs = require("fs");

function fetch(inputUrl) {
    return new Promise((resolve, reject) => {
        https
            .get(inputUrl, (res) => {
                let data = [];

                res.on("data", (chunk) => {
                    data.push(chunk);
                });

                res.on("end", () => {
                    resolve(Buffer.concat(data));
                });
            })
            .on("error", (err) => {
                reject(err);
            });
    });
}

async function getHash32FromBuffer(buffer) {
    const hashBuffer = new Uint8Array(
        crypto.createHash("sha256").update(buffer).digest(),
    );
    let n =
            (hashBuffer.reduce((acc, k) => acc * 256n + BigInt(k), 0n) *
                256n ** 3n) /
            32n ** 3n,
        res = "";
    while ((n /= 32n) !== 0n)
        res = "abcdefghijklmnopqrstuvwxyz234567"[Number(n % 32n)] + res;
    return res;
}

(async () => {
    const input = process.argv[2];

    if (!input) {
        console.error("Please provide a filename or URL as an argument.");
        return;
    }

    try {
        const parsedUrl = url.parse(input);

        let buffer;

        if (parsedUrl.protocol && parsedUrl.host) {
            // It's a URL
            buffer = await fetch(input);
        } else {
            // It's a local file
            buffer = fs.readFileSync(input);
        }

        const hash32 = await getHash32FromBuffer(buffer);

        if (parsedUrl.protocol && parsedUrl.host) {
            console.log(
                `https://${hash32}.caddr.org/?src=${encodeURIComponent(input)}`,
            );
        } else {
            console.log(
                `https://${hash32}.caddr.org/?src=${encodeURIComponent(input)}`,
            );
        }
    } catch (e) {
        console.error("Error generating caddr URL:", e.message);
    }
})();
