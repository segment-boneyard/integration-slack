
/**
 * Module dependencies.
 */

var integration = require('segmentio-integration');
var handlebars = require('handlebars');
var extend = require('extend');
var decode = require('entities').decodeHTML;

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

Slack.prototype.identify = identify;
Slack.prototype.track = track;

/**
 * Identify.
 */

function identify(identify, fn) {
  // `email` is needed to send to Slack.
  if (!identify.email()) return fn('No email');

  var template = 'Identified new user, {{name}} at {{email}}. {{traits}}';
  var compiled = handlebars.compile(template);
  var traits = identify.json().traits;
  var traitsText = '\n';
  for (var props in traits) {
    if (traits.hasOwnProperty(props)) traitsText += props + ': ' + traits[props] + '\n';
  }

  var templateData = extend(identify.json(), {
    name: getName(identify),
    email: identify.email(),
    traits: traitsText
  });
  var text;

  try {
    text = compiled(templateData);
  } catch (e) {
    return fn(e);
  }

  var payload = {
    text: decode(text),
    username: 'Segment',
    icon_url: 'https://logo.clearbit.com/segment.com'
  };

  return this
    .post(this.settings.webhookUrl)
    .send(payload)
    .end(fn);
}

/**
 * Track.
 */

function track(track, fn){
  var template = this.settings.templates[track.event()] || '{{name}} did {{event}}.';
  var compiled = handlebars.compile(template);
  var templateData = extend(track.json(), {
    name: getName(track)
  });
  var text;
  try {
    text = compiled(templateData);
  } catch (e) {
    return fn(e);
  }
  var payload = {
    text: decode(text),
    username: 'Segment',
    icon_url: 'https://logo.clearbit.com/segment.com'
  };

  var channel = this.settings.channels[track.event()];
  if (channel) payload.channel = channel;

  return this
    .post(this.settings.webhookUrl)
    .send(payload)
    .end(fn);
}

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

function getName(message) {
  var name = message.proxy('context.traits.name') || message.proxy('traits.name');
  if (name) return name;

  var firstName = message.proxy('context.traits.firstName') || message.proxy('traits.firstName');
  var lastName = message.proxy('context.traits.lastName') || message.proxy('traits.lastName');

  if (firstName && lastName) return firstName + ' ' + lastName;
  if (firstName) return firstName;
  if (lastName) return lastName;

  var username = message.proxy('context.traits.username') || message.proxy('traits.username');
  if (username) return username;

  var email = message.email();
  if (email) return email;

  var userId = message.userId();
  if (userId) return 'User ' + message.userId();

  return 'Anonymous user ' + message.anonymousId();
}
