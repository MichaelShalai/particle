// https://cloud.google.com/appengine/docs/flexible/nodejs/runtime

const colors = require('colors')
const util = require('util')
const {PubSub} = require('@google-cloud/pubsub')
const {Firestore} = require('@google-cloud/firestore');

/* CONFIGURATION */
let config = {
    gcpProjectId: 'smart-home-224317',
    gcpPubSubSubscriptionName: 'weather_station-json',
    gcpServiceAccountKeyFilePath: './key.json'
}
_checkConfig();
/* END CONFIGURATION */

/* PUBSUB */
console.log(colors.magenta('Authenticating PubSub with Google Cloud...'))
const pubsub = new PubSub({
    projectId: config.gcpProjectId,
    keyFilename: config.gcpServiceAccountKeyFilePath,
})
console.log(colors.magenta('Authentication successful!'))

const subscription = pubsub.subscription(config.gcpPubSubSubscriptionName);
subscription.on('message', message => {
    console.log(colors.cyan('Particle event received from Pub/Sub!\r\n'), _createParticleEventObjectForStorage(message, true));
    // Called every time a message is received.
    // message.id = ID used to acknowledge its receival.
    // message.data = Contents of the message.
    // message.attributes = Attributes of the message.
    storeEvent(message);
    message.ack();
});
/* END PUBSUB */

/* DATASTORE */
console.log(colors.magenta('Authenticating Datastore with Google Cloud...'))
const datastore = new Firestore({
    projectId: config.gcpProjectId,
    keyFilename: config.gcpServiceAccountKeyFilePath,
})
// const settings = {
//     timestampsInSnapshots: true
// };
// datastore.settings(settings);
console.log(colors.magenta('Authentication successful!'))

function storeEvent(message) {
    const data = _createParticleEventObjectForStorage(message, false);
    // const date = new Date(data.published_at);
    // const name = date.toISOString().slice(0,19).replace(/[-:]/g,"").replace(/[T]/g,"-");
    // console.log(name);

    let collection = datastore.collection('WeatherStation');
    let doc = collection.doc(/* name */);
    doc
        .set(data)
        .then(() => {
            console.log(colors.green('Particle event stored in Datastore!\r\n'), data);
        })
        .catch(err => {
            console.log(colors.red('There was an error storing the event:'), err);
        });

};
/* END DATASTORE */

/* HELPERS */
function _checkConfig() {
    if (config.gcpProjectId === '' || !config.gcpProjectId) {
        console.log(colors.red('You must set your Google Cloud Platform project ID in pubSubToDatastore.js'));
        process.exit(1);
    }
    if (config.gcpPubSubSubscriptionName === '' || !config.gcpPubSubSubscriptionName) {
        console.log(colors.red('You must set your Google Cloud Pub/Sub subscription name in pubSubToDatastore.js'));
        process.exit(1);
    }
};

function _createParticleEventObjectForStorage(message, log) {
    let data = {};
    try {
      data = JSON.parse(message.data);
    } catch(err) {
      console.log(colors.red(err));
    }

    let obj = {
        gc_pub_sub_id: message.id,
        device_id: message.attributes.device_id,
        event: message.attributes.event,
        data: data,
        published_at: message.attributes.published_at
    }

    if (log) {
        return colors.grey(util.inspect(obj));
    } else {
        return obj;
    }
};
/* END HELPERS */