'use strict';

/**
 * Module dependencies.
 */

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

exports.getName = function getName(message) {
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

/**
 * Does object include keys in array?
 *
 * @param {obj} object
 * @param {arr} array
 *
 * @return {boolean}
 */

exports.includesKeys = function includesKeys(object, array) {
  var hasKeys = true;
  for (var i = 0; i < array.length; i++) {
    if (!Object.keys(object).includes(array[i])) {
      hasKeys = false;
      break;
    }
  }
  return hasKeys;
}
