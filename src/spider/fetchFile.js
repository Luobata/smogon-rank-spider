/**
 * @description 爬虫
 * @auth luobata(batayao@sohu-inc.com)
 * @time 2017年2月11日18:31:08
 */

/**
 * @file 统计smogon统计概率
 * @auth luobata(batayao@sohu-inc.com)
 */

import fs from 'fs';
import path from 'path';
import http from 'http';
import url from 'url';
import download from '../lib/download.js';

const smogonRoot = 'http://www.smogon.com/stats/';

const logFormate = (root, fileName) => {
    var log = fs.readFileSync(root + fileName, 'utf-8');
    var pokemons = log.split('\n').splice(3);
    var head = pokemons.shift();
    // 去除头尾分隔符
    pokemons.shift();
    pokemons.pop();
    pokemons.pop();
    var typeLen = {
        name: 0,
        rank: 0,
        usage: 0
    };
    var str = {
        rank: 'Rank',
        name: 'Pokemon',
        usage: 'Usage'
    };
    var rank = {};
    var headFormate = function (head) {
        head.split('|').forEach(function (item) {
            if (item.indexOf(str.rank) !== -1) {
                typeLen.rank = item.length;
            } else if (item.indexOf(str.name) !== -1) {
                typeLen.name = item.length;
            } else if (item.indexOf(str.usage) !== -1) {
                typeLen.usage = item.length;
            }
        });
    }
    var rankFormate = function (pokemons) {
        pokemons.forEach(function (item) {
            var pm = item.trim().split('|');
            pm = pm.slice(1, pm.length - 1);
            var id = pm[0];
            var name = pm[1];
            var usage = pm[2];
            rank[name] = {
                rank: id,
                usage: usage
            };
        });
    }
    headFormate(head);
    rankFormate(pokemons);
    return rank;
};

const rankFormate = (rankA, rankB) => {
    for (var k in rankB) {
        var change;
        var rankChange;
        if (rankA[k]) {
            change = parseFloat(rankB[k].usage, 10) - parseFloat(rankA[k].usage, 10) + '%';
            rankChange = parseInt(rankA[k].rank, 10) - parseInt(rankB[k].rank, 10);

        } else {
            change = parseFloat(rankB[k].usage, 10) + '%';
            rankChange = parseInt(rankB[k].rank, 10);
        }
        rankB[k].change = change;
        rankB[k].rankChange = rankChange;
    }
    return rankB;
};

export default (month, fileName, fileRoot) => {
    var dist = fileRoot + '/dist/' + month + '/';
    var rank = '';
    var downloadArr = [];
    if (!fs.existsSync(dist)) {
        fs.mkdirSync(dist);
    }
    if (!fs.existsSync(dist + fileName + '.txt')) {
        downloadArr.push(download(smogonRoot + '/' + month + '/' + fileName + '.txt', dist, fileName + '.txt'));
    }
    Promise.all(downloadArr)
        .then(function () {
            console.log('all over');
            // rank = logFormate(dist, fileName + '.txt');
        }, function () {
            console.log('download file error');
        })
        .then(function () {
            // fs.writeFileSync(source + fileName + '.json', JSON.stringify(rank), 'utf-8');
        })
        .then(function () {
            console.log('data end');
        })
        .catch(function (e) {
            console.error('an error happened:' + e.message);
        });

};
