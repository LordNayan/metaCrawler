const parser = require('node-html-parser');
const axios = require('axios');
const config = require("../config/config");
const redis = require("../connections/redisConnection");
const util = require("../enums/util");

async function metaCrawl(req, res) {
    let start = process.hrtime();
    try {
        util.log("metaCrawl started");
        const body = req.body;
        const url = body.url;
        let meta = {}, og = {}, siteData;

        //Check for data in redis 
        if (redis.status == "ready") {
            siteData = await redis.get(url);
        }

        //Hit the url to get html data from website if redis key not present 
        if (!siteData) {
            const axiosHeaders = {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            }
            siteData = await axios.get(encodeURI(url), axiosHeaders, { timeout: config.axios.timeout });
            siteData = siteData.data;
            if (redis.status == "ready") {
                await redis.set(url, siteData, "EX", config.redis.ttl);
            }
        }

        //Parse html 
        const parsedData = parser.parse(siteData);

        //get OG Images and Videos
        const ogImages = getOgImages(parsedData);
        const ogVideos = getOgVideos(parsedData);

        //get all Images
        const images = getImages(parsedData);

        //get data from Metas
        const extractedMeta = extractMeta(parsedData);
        og = extractedMeta.og;
        meta = extractedMeta.meta;
        og.images = ogImages;
        og.videos = ogVideos;

        //construct result
        const result = { meta: meta, og: og, images: images };

        util.print();
        util.log("metaCrawl Ended", start);

        res.send(result);
    }
    catch (error) {
        util.log("Error in metaCrawl", start, "error", error);
        error = util.error("Data not found", "101");
        let statusCode = error.http_code;
        delete (error.http_code);
        res.status(statusCode).send(error);
    }
}

function getOgImages(pData) {
    let images = [];
    pData.querySelectorAll('meta').forEach(function (elem) {

        let propertyName = elem.getAttribute('property') || elem.getAttribute('name');
        let content = elem.getAttribute('content');
        if (propertyName === 'og:image' || propertyName === 'og:image:url') {
            images.push(content);
        }
    });
    return images;
}

function getImages(pData) {
    let images = [];
    pData.querySelectorAll('img').forEach(function (elem) {
        let src = elem.getAttribute('src');
        if (src) {
            images.push(src);
        }
    });
    return images;
}

function getOgVideos(pData) {
    let videos = [];

    pData.querySelectorAll('meta').forEach(function (elem) {
        let propertyName = elem.getAttribute('property') || elem.getAttribute('name');
        let content = elem.getAttribute('content');

        if (propertyName === 'og:video' || propertyName === 'og:video:url') {
            videos.push({ url: content });
        }

        let current = videos[videos.length - 1];

        switch (propertyName) {
            case 'og:video:secure_url':
                current.secure_url = content;
                break;
            case 'og:video:type':
                current.type = content;
                break;
            case 'og:video:width':
                current.width = parseInt(content, 10);
                break;
            case 'og:video:height':
                current.height = parseInt(content, 10);
                break;
        }

    });


    return videos;
}

function extractMeta(pData) {
    let title = pData.querySelector('title');
    let metas = pData.querySelectorAll('meta');
    let og = {}, meta = {};

    if (title) {
        meta.title = title.text;
    }

    for (let i = 0; i < metas.length; i++) {
        let elem = metas[i];

        if (getMeta(elem, 'og:description'))
            og.description = getMeta(elem, 'og:description');

        if (getMeta(elem, 'og:title'))
            og.title = getMeta(elem, 'og:title');

        if (getMeta(elem, 'image'))
            meta.image = getMeta(elem, 'image');

        if (getMeta(elem, 'og:type'))
            og.type = getMeta(elem, 'og:type');

        if (getMeta(elem, 'og:url'))
            og.url = getMeta(elem, 'og:url');

        if (getMeta(elem, 'title'))
            meta.title = getMeta(elem, 'title');

        if (getMeta(elem, 'og:site_name'))
            og.site_name = getMeta(elem, 'og:site_name');

        if (getMeta(elem, 'description'))
            meta.description = getMeta(elem, 'description');
    }
    return { og: og, meta: meta };
}

function getMeta(metaElem, name) {
    let attr = metaElem.getAttribute('name') || metaElem.getAttribute('property');
    return attr == name ? metaElem.getAttribute('content') : null;
}

module.exports = metaCrawl;