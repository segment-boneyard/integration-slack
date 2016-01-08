
/**
 * Module dependencies.
 */

var integration = require('segmentio-integration');
var handlebars = require('handlebars');
var extend = require('extend');
var map = require('lodash.map');
var omit = require('lodash.omit');
var flat = require('flat');

/**
 * Expose `Slack`
 */

var Slack = module.exports = integration('Slack')
  .channels(['server', 'mobile', 'client'])
  .ensure('settings.webhookUrl')
  .retries(1);

/**
 * Set up our prototype methods.
 */

Slack.prototype.track = send;

/** Send an event to the Slack API. */
function send(track, fn){
  /**
   * Get a human readable name for the user:
   * 1. Check traits.name
   * 2. Check traits.firstName + traits.lastName
   * 3. Check traits.firstName
   * 4. Check traits.lastName
   * 5. Check traits.username
   * 6. Check traits.email
   * 7. Use 'User ' + userId
   * 8. Use 'Anonymous user ' + anonymousId
   *
   * @return {string}
   */
  var getName = function() {
    var name = track.proxy('traits.name');
    if (name) return name;

    var firstName = track.proxy('traits.firstName');
    var lastName = track.proxy('traits.lastName');
    if (firstName && lastName) return firstName + ' ' + lastName;
    if (firstName) return firstName;
    if (lastName) return lastName;

    var username = track.proxy('traits.username');
    if (username) return username;

    var email = track.email();
    if (email) return email;

    var userId = track.userId();
    if (userId) return 'User ' + track.userId();

    return 'Anonymous user ' + track.anonymousId();
  };

  var template = this.settings.templates[track.event()] || '{{name}} did {{event}}.';
  var compiled = handlebars.compile(template);
  var templateData = extend(track.json(), {
    name: getName()
  });
  var text = compiled(templateData);

  var fields = map(flat(omit(track.json(), ['timestamp', 'type'])), function(value, key) {
    return {
      "title": key,
      "value": value,
      "short": true
    };
  });
  var payload = {
    text: text,
    username: 'Segment',
    icon_url: 'https://logo.clearbit.com/segment.com',
    attachments: [
      {
        fields: fields,
        author_name: '@segment',
        author_icon: 'https://logo.clearbit.com/segment.com',
        author_link: 'https://segment.com/'
      }
    ]
  };

  var channel = this.settings.channels[track.event()];
  if (channel) payload.channel = channel;

  return this
    .post(this.settings.webhookUrl)
    .send(payload)
    .end(fn);
}
