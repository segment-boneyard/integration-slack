
var Test = require('segmentio-integration-tester');
var helpers = require('./helpers');
var assert = require('assert');
var Slack = require('..');

describe('Slack', function() {
  var slack;
  var settings;
  var test;

  beforeEach(function(){
    settings = {
      webhookUrl: 'https://hooks.slack.com/services/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',
      channels: {},
      templates: {}
    };
    slack = new Slack(settings);
    test = Test(slack, __dirname);
  });

  it('should have the correct settings', function(){
    test
      .name('Slack')
      .channels(['server', 'mobile', 'client'])
      .ensure('settings.webhookUrl');
  });

  describe('.validate()', function() {
    it('should not be valid without a webhookUrl', function(){
      test.invalid({}, {});
    });

    it('should be valid with a webhookUrl', function(){
      test.valid({}, { webhookUrl: 'webhookUrl' });
    });
  });

  describe('.identify()', function() {
    it('should map identify calls correctly', function(done) {
      var json = test.fixture('identify-basic');
      var output = json.output;
      output.username = 'Segment';
      output.icon_url = 'https://logo.clearbit.com/segment.com';
      test
        .set(settings)
        .identify(json.input)
        .sends(output)
        .expects(200, done);
    });
  });

  describe('.track()', function() {
    it('should map track calls correctly', function(done){
      var json = test.fixture('track-basic');
      var output = json.output;
      output.username = 'Segment';
      output.icon_url = 'https://logo.clearbit.com/segment.com';
      test
        .set(settings)
        .track(json.input)
        .sends(output)
        .expects(200, done);
    });

    it('should fail invalid templates gracefully', function(done){
      var json = test.fixture('track-basic');
      var output = json.output;
      output.username = 'Segment';
      output.icon_url = 'https://logo.clearbit.com/segment.com';
      settings.templates = {
        "my-event": "{{invalid template"
      };
      test
        .set(settings)
        .track(json.input)
        .error(done);
    });

    it('should map track calls with email correctly', function(done){
      var json = test.fixture('track-email');
      var output = json.output;
      output.username = 'Segment';
      output.icon_url = 'https://logo.clearbit.com/segment.com';
      test
        .set(settings)
        .track(json.input)
        .sends(output)
        .expects(200, done);
    });

    it('should map track calls with name correctly', function(done){
      var json = test.fixture('track-name');
      var output = json.output;
      output.username = 'Segment';
      output.icon_url = 'https://logo.clearbit.com/segment.com';
      test
        .set(settings)
        .track(json.input)
        .sends(output)
        .expects(200, done);
    });

    it('should map track calls with first and last name correctly', function(done){
      var json = test.fixture('track-name-first-last');
      var output = json.output;
      output.username = 'Segment';
      output.icon_url = 'https://logo.clearbit.com/segment.com';
      test
        .set(settings)
        .track(json.input)
        .sends(output)
        .expects(200, done);
    });

    it('should map track calls with username correctly', function(done){
      var json = test.fixture('track-username');
      var output = json.output;
      output.username = 'Segment';
      output.icon_url = 'https://logo.clearbit.com/segment.com';
      test
        .set(settings)
        .track(json.input)
        .sends(output)
        .expects(200, done);
    });

    it('should map track calls with custom channel correctly', function(done){
      var json = test.fixture('track-basic');
      var output = json.output;
      output.channel = '#testing-slack-api'
      output.username = 'Segment';
      output.icon_url = 'https://logo.clearbit.com/segment.com';
      settings.channels = {
        "my-event": "#testing-slack-api"
      };
      test
        .set(settings)
        .track(json.input)
        .sends(output)
        .expects(200, done);
    });

    it('should map track calls with custom templates correctly', function(done){
      var json = test.fixture('track-template');
      var output = json.output;
      output.username = 'Segment';
      output.icon_url = 'https://logo.clearbit.com/segment.com';
      settings.templates = {
        "Completed Order": "{{name}} bought an item worth ${{properties.revenue}}"
      };
      test
        .set(settings)
        .track(json.input)
        .sends(output)
        .expects(200, done);
    });

    it('should decode HTML entities from templates', function(done){
      var json = test.fixture('track-entities');
      var output = json.output;
      settings.templates = {
        'Got a new tattoo': '{{properties.comment}}'
      };
      output.username = 'Segment';
      output.icon_url = 'https://logo.clearbit.com/segment.com';
      test
        .set(settings)
        .track(json.input)
        .sends(output)
        .expects(200, done);
    });
  });
});
