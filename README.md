# [Infinite](http://infinite.psim.us)

[![Build Status](https://travis-ci.org/FakeSloth/Infinite.svg)](https://travis-ci.org/FakeSloth/Infinite)
[![Dependency Status](https://david-dm.org/FakeSloth/Infinite.svg)](https://david-dm.org/FakeSloth/Infinite)
[![devDependency Status](https://david-dm.org/FakeSloth/Infinite/dev-status.svg)](https://david-dm.org/FakeSloth/Infinite#info=devDependencies)

Infinite's Pokemon Showdown Server

Prerequisites
-------------

<table>
  <tr>
    <td>
      <b>Node.js</b>
    </td>
    <td>
      <b>MongoDB</b>
    </td>
  </tr>
  <tr>
    <td>
      <a href="http://nodejs.org">
        <img src="http://nodejs.org/images/logos/nodejs.png" height="50" title="Node.js">
      </a>
    </td>
    <td>
      <a href="http://www.mongodb.org/downloads">
        <img src="http://www.mongodb.com/sites/mongodb.com/files/media/mongodb-logo-rgb.jpeg" height="50" title="MongoDB">
      </a>
    </td>
  </tr>
</table>

Getting Started
---------------

The easiest way to get started is to clone the repository:

```bash
$ git clone https://github.com/FakeSloth/Infinite.git
```

Infinite requires [MongoDB](http://www.mongodb.com). Open up
another command prompt or terminal:

```bash
$ mongod
```

Emoticons
---------

To make the username look normal when using emoticons, put this in your css:

```css
.emote-chat {
  background: none;
  border: 0;
  padding: 0 5px 0 0;
  font-family: Verdana;
  font-size: 9pt;
}
```

Contributing
------------

To test infinite's code, use `grunt && mocha`:

```bash
$ grunt && mocha
```

Try to keep all code inside of either `infinite` or `chat-plugins` folder to
avoid merge conflicts with the main Pokemon-Showdown repository.
