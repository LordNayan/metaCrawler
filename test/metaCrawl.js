let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
chai.use(chaiHttp);
let server = require('../app');
let config = require("../src/config/config");
let testUrl = config.test.testUrl;

describe('Meta Crawler', () => {
    let path = "/meta/get";
    describe('/POST meta/get', () => {
        it('it should GET all the meta info', (done) => {
            chai.request(server)
                .post(path)
                .send({ "url": testUrl })
                .end((error, res) => {
                    if (error) {
                        done(error);
                    }
                    (res).should.have.status(200);
                    (res.body).should.be.a('object');
                    done();
                    process.exit()
                });
        });
    });
});