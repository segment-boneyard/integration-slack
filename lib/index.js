
/**
 * Module dependencies.
 */

var integration = require('segmentio-integration');
var includesKeys = require('./utils').includesKeys;
var handlebars = require('handlebars');
var getName = require('./utils').getName;
var decode = require('entities').decodeHTML;
var extend = require('extend');

/**
 * Expose `Slack`
 */

var Slack = module.exports = integration('Slack')
  .channels(['server', 'mobile', 'client'])
  .ensure('settings.webhookUrl')
  .retries(1);

/**
 * Ensure.
 */

Slack.ensure(function(msg, settings) {
  if (msg.type() === 'identify') {
    if (settings.whiteListedTraits.length === 0) return this.reject('No white listed traits were set.');
    if (!includesKeys(msg.traits(), settings.whiteListedTraits)) return this.reject('Only identify calls that include `traits` in settings will be sent.');
  }
});

/**
 * Set up our prototype methods.
 */

Slack.prototype.identify = identify;
Slack.prototype.track = track;

/**
 * Identify.
 */

function identify(identify, fn) {
  var template = this.settings.identifyTemplates['identify'] || 'Identified {{name}}. \n{{traits}}';
  var compiled = handlebars.compile(template);
  var traits = identify.traits();
  var traitsText = '';
  for (var props in traits) {
    if (traits.hasOwnProperty(props)) traitsText += props + ': ' + traits[props] + '\n';
  }

  var templateData = extend(identify.traits(), {
    name: getName(identify),
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
