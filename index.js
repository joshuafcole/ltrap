var _ = require('underscore');
var $ = require('jquery');
var path = require('path');



var ltdir = window.lt.util.load.pwd;
path.join(ltdir, 'plugins', 'recall');

module.exports = function(window, localRoot) {
  var cljs = window.cljs;
  var lt = window.lt;

  /*************************************************************************\
   * CLJS Helpers
  \*************************************************************************/
  /*\
  |*| Casts a string into a cljs keyword.
  \*/
  function toKeyword(name) {
    return new cljs.core.Keyword(null, name, name);
  }


  /*************************************************************************\
   * LT Helpers
  \*************************************************************************/
  /*\
  |*| Requires plugin-local files and modules.
  \*/
  function requireLocal(name, root) {
    root = root || localRoot;
    var module;

    // File include
    try {
      module = require(path.join(root, name));
    } catch (e) {
      if(e.code !== 'MODULE_NOT_FOUND') {
        throw e;
      }
    }

    // Module include
    if(!module) {
      module = require(path.join(root, 'node_modules', name));
    }

    // Global include
    if(!module) {
      module = require(name);
    }

    return module;
  }

  /*\
  |*| Registers functions as CodeMirror actions.
  |*| Currently used as a hack becasue CodeMirror actions are the only
  |*| Functions I know how to create and trigger in keymaps.
  \*/
  function addAction(commandName, command) {
    var CodeMirror = window.CodeMirror;

    if (!CodeMirror.commands[commandName]) {
      CodeMirror.commands[commandName] = command;
    }
  }

  /*\
  |*| Invokes a native LT command (anything that is registered with the commandbar).
  \*/
  function command(name) {
    var args = [].slice.call(arguments, 1);
    var kw = toKeyword(name);
    args.unshift(kw);
    return lt.objs.command.exec_BANG_.apply(lt.objs.command.command, args);
  }

  /*\
  |*| Tells Light Table to listen to and dispatch key events for the given context.
  \*/
  function enterContext(context) {
    var keyword = toKeyword(context);
    lt.objs.context.in_BANG_.call(null, keyword, null);
  }

  /*\
  |*| Tells Light Table to cease listening to and dispatching key events for the given context.
  \*/
  function exitContext(context) {
    var keyword = toKeyword(context);
    lt.objs.context.out_BANG_.call(null, keyword, null);
  }



  /*************************************************************************\
   * Tab Helpers
  \*************************************************************************/

  /*\
  |*| @TODO: Implement me.
  |*| Gets a list of all open tabs, represented in a 2D array of [group][file]
  \*/
  function getTabs() {
    var tabsets = $('#multi .tabset');
    return _.map(tabsets, function(tabset) {
      return _.map($(tabset).find('.list li'), function(tab) {
        return $(tab).attr('title');
      });
    });
  }

  /*\
  |*| Gets the currently active tab as an html element.
  |*| @NOTE: Does not work with multiple tabsets.
  \*/
  function getActiveTab() {
    return $('#multi .tabset > .list li.active');
  }

  /*\
  |*| Gets the filepath of the currently active tab, super hacky.
  |*| @NOTE: Does not work with multiple tabsets.
  \*/
  function getActiveFile() {
    return getActiveTab().attr('title');
  }

  /*\
  |*| Gets the directory containing the current buffer if one exists, or home.
  |*| cwd in LT points to LT's directory
  |*| @NOTE: Does not work with multiple tabsets
  \*/
  function getActiveDirectory() {
    var dir = path.dirname(getActiveFile());
    if(dir === '.') {
      dir = '~';
    }
    return dir + path.sep;
  }

  /*************************************************************************\
   * UI Helpers
  \*************************************************************************/
  /*\
  |*| Opens a synchronous dialog with the given message, returning the result
  |*| of user interaction, if any.
  \*/
  var prompt = window.prompt;
  var confirm = window.confirm;

  /*\
  |*| Toggles an element's visiblity. Returns truthy if
  |*| opened and falsy if closed.
  \*/
  function showContainer(container) {
    var $container = $(container);
    var height = $container.height();
    if(height === 0) {
      $container.height('auto');
    } else {
      $container.height(0);
    }

    return !height;
  }

  /*\
  |*| Adds an element to a container's .content div.
  \*/
  function addItem(container, item) {
    $(container).children('.content').first().append(item);
  }

  return {
    // cljs
    toKeyword: toKeyword,

    // lt
    requireLocal: requireLocal,
    addAction: addAction,
    command: command,
    enterContext: enterContext,
    exitContext: exitContext,

    // tab
    getActiveTab: getActiveTab,
    getTabs: getTabs,
    getActiveFile: getActiveFile,
    getActiveDirectory: getActiveDirectory,

    // UI
    prompt: prompt,
    confirm: confirm,
    showContainer: showContainer,
    addItem: addItem
  };
};
