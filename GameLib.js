;
( ->
  # Assume game objects
  collides = (a, b) ->
    # TODO: Be smart about auto-detecting collision types
    Collision.rectangular(a.bounds(), b.bounds())

  ###*
  Collision holds many useful class methods for checking geometric overlap of various objects.

  @name Collision
  @namespace
  ###
  Collision =
    ###*
    Collision holds many useful class methods for checking geometric overlap of various objects.

    <code><pre>
    player = GameObject
      x: 0
      y: 0
      width: 10
      height: 10

    enemy = GameObject
      x: 5
      y: 5
      width: 10
      height: 10

    enemy2 = GameObject
      x: -5
      y: -5
      width: 10
      height: 10

    Collision.collide(player, enemy, (p, e) -> ...)
    # => callback is called once

    Collision.collide(player, [enemy, enemy2], (p, e) -> ...)
    # => callback is called twice
    </pre></code>

    @name collide
    @methodOf Collision
    @param {Object|Array} groupA An object or set of objects to check collisions with
    @param {Object|Array} groupB An objcet or set of objects to check collisions with
    @param {Function} callback The callback to call when an object of groupA collides 
    with an object of groupB: (a, b) ->
    ###
    collide: (groupA, groupB, callback) ->
      groupA = [].concat(groupA)
      groupB = [].concat(groupB)

      groupA.each (a) ->
        groupB.each (b) ->
          callback(a, b) if collides(a, b)

    ###*
    Takes two bounds objects and returns true if they collide (overlap), false otherwise.
    Bounds objects have x, y, width and height properties.

    <code><pre>
    player = GameObject
      x: 0
      y: 0
      width: 10
      height: 10

    enemy = GameObject
      x: 5
      y: 5
      width: 10
      height: 10

    Collision.rectangular(player, enemy)
    # => true

    Collision.rectangular(player, {x: 50, y: 40, width: 30, height: 30})
    # => false
    </pre></code>

    @name rectangular
    @methodOf Collision
    @param {Object} a The first rectangle
    @param {Object} b The second rectangle
    @returns {Boolean} true if the rectangles overlap, false otherwise
    ###
    rectangular: (a, b) ->
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y

    ###*
    Takes two circle objects and returns true if they collide (overlap), false otherwise.
    Circle objects have x, y, and radius.

    <code><pre>
    player = GameObject
      x: 5
      y: 5
      radius: 10

    enemy = GameObject
      x: 10
      y: 10
      radius: 10

    farEnemy = GameObject
      x: 500
      y: 500
      radius: 30

    Collision.circular(player, enemy)
    # => true

    Collision.circular(player, farEnemy)
    # => false
    </pre></code>

    @name circular
    @methodOf Collision
    @param {Object} a The first circle
    @param {Object} b The second circle
    @returns {Boolean} true is the circles overlap, false otherwise
    ###
    circular: (a, b) ->
      r = a.radius + b.radius
      dx = b.x - a.x
      dy = b.y - a.y

      r * r >= dx * dx + dy * dy

    ###*
    Detects whether a line intersects a circle.

    <code><pre>
    circle = engine.add
      class: "circle"
      x: 50
      y: 50
      radius: 10

    Collision.rayCircle(Point(0, 0), Point(1, 0), circle)
    # => true
    </pre></code>

    @name rayCircle
    @methodOf Collision
    @param {Point} source The starting position
    @param {Point} direction A vector from the point
    @param {Object} target The circle 
    @returns {Boolean} true if the line intersects the circle, false otherwise
    ###
    rayCircle: (source, direction, target, length=null) ->
      radius = target.radius()
      target = target.position()

      laserToTarget = target.subtract(source)

      projectionLength = direction.dot(laserToTarget)

      if projectionLength < 0
        return false # object is behind
      if length? and projectionLength > length
        return false # segment is too short

      projection = direction.scale(projectionLength)

      intersection = source.add(projection)
      intersectionToTarget = target.subtract(intersection)
      intersectionToTargetLength = intersectionToTarget.length()

      if intersectionToTargetLength < radius
        hit = true

      if hit
        dt = Math.sqrt(radius * radius - intersectionToTargetLength * intersectionToTargetLength)

        hit = direction.scale(projectionLength - dt).add(source)

    ###*
    Detects whether a line intersects a rectangle.

    <code><pre>
    rect = engine.add
      class: "circle"
      x: 50
      y: 50
      width: 20
      height: 20

    Collision.rayRectangle(Point(0, 0), Point(1, 0), rect)
    # => true
    </pre></code>

    @name rayRectangle
    @methodOf Collision
    @param {Point} source The starting position
    @param {Point} direction A vector from the point
    @param {Object} target The rectangle
    @returns {Boolean} true if the line intersects the rectangle, false otherwise
    ###
    rayRectangle: (source, direction, target) ->
      xw = target.xw
      yw = target.yw

      if source.x < target.x
        xval = target.x - xw
      else
        xval = target.x + xw

      if source.y < target.y
        yval = target.y - yw
      else
        yval = target.y + yw

      if direction.x == 0
        p0 = Point(target.x - xw, yval)
        p1 = Point(target.x + xw, yval)

        t = (yval - source.y) / direction.y
      else if direction.y == 0
        p0 = Point(xval, target.y - yw)
        p1 = Point(xval, target.y + yw)

        t = (xval - source.x) / direction.x
      else
        tX = (xval - source.x) / direction.x
        tY = (yval - source.y) / direction.y

        # TODO: These special cases are gross!
        if (tX < tY || (-xw < source.x - target.x < xw)) && !(-yw < source.y - target.y < yw)
          p0 = Point(target.x - xw, yval)
          p1 = Point(target.x + xw, yval)

          t = tY
        else
          p0 = Point(xval, target.y - yw)
          p1 = Point(xval, target.y + yw)

          t = tX

      if t > 0
        areaPQ0 = direction.cross(p0.subtract(source))
        areaPQ1 = direction.cross(p1.subtract(source))

        if areaPQ0 * areaPQ1 < 0
          hit = direction.scale(t).add(source)

  (exports ? this)["Collision"] = Collision
)()

;
;
;
;
;
;
;
var Emitter;
Emitter = function(I) {
  var self;
  self = GameObject(I);
  return self.include(Emitterable);
};;
var Emitterable;
Emitterable = function(I, self) {
  var n, particles;
  I || (I = {});
  Object.reverseMerge(I, {
    batchSize: 1,
    emissionRate: 1,
    color: "blue",
    width: 0,
    height: 0,
    generator: {},
    particleCount: Infinity,
    particleData: {
      acceleration: Point(0, 0.1),
      age: 0,
      color: "blue",
      duration: 30,
      includedModules: ["Movable"],
      height: 2,
      maxSpeed: 2,
      offset: Point(0, 0),
      sprite: false,
      spriteName: false,
      velocity: Point(-0.25, 1),
      width: 2
    }
  });
  particles = [];
  n = 0;
  return {
    before: {
      draw: function(canvas) {
        return particles.invoke("draw", canvas);
      },
      update: function() {
        I.batchSize.times(function() {
          var center, key, particleProperties, value, _ref;
          if (n < I.particleCount && rand() < I.emissionRate) {
            center = self.center();
            particleProperties = Object.reverseMerge({
              x: center.x,
              y: center.y
            }, I.particleData);
            _ref = I.generator;
            for (key in _ref) {
              value = _ref[key];
              if (I.generator[key].call) {
                particleProperties[key] = I.generator[key](n, I);
              } else {
                particleProperties[key] = I.generator[key];
              }
            }
            particleProperties.x += particleProperties.offset.x;
            particleProperties.y += particleProperties.offset.y;
            particles.push(GameObject(particleProperties));
            return n += 1;
          }
        });
        particles = particles.select(function(particle) {
          return particle.update();
        });
        if (n === I.particleCount && !particles.length) {
          return I.active = false;
        }
      }
    }
  };
};;
(function() {
  var Engine, defaults;
  defaults = {
    FPS: 30,
    age: 0,
    ambientLight: 1,
    backgroundColor: "#00010D",
    cameraTransform: Matrix.IDENTITY,
    clear: false,
    excludedModules: [],
    includedModules: [],
    paused: false,
    showFPS: false,
    zSort: false
  };
  /**
  The Engine controls the game world and manages game state. Once you 
  set it up and let it run it pretty much takes care of itself.

  You can use the engine to add or remove objects from the game world.

  There are several modules that can include to add additional capabilities 
  to the engine.

  The engine fires events that you  may bind listeners to. Event listeners 
  may be bound with <code>engine.bind(eventName, callback)</code>

  @name Engine
  @constructor
  @param {Object} I Instance variables of the engine 
  */
  /**
  Observe or modify the 
  entity data before it is added to the engine.
  @name beforeAdd
  @methodOf Engine#
  @event
  @param {Object} entityData
  */
  /**
  Observe or configure a <code>gameObject</code> that has been added 
  to the engine.
  @name afterAdd
  @methodOf Engine#
  @event
  @param {GameObject} object The object that has just been added to the
  engine.
  */
  /**
  Called when the engine updates all the game objects.

  @name update
  @methodOf Engine#
  @event
  */
  /**
  Called after the engine completes an update. Here it is 
  safe to modify the game objects array.

  @name afterUpdate
  @methodOf Engine#
  @event
  */
  /**
  Called before the engine draws the game objects on the canvas. The current camera transform is applied.

  @name beforeDraw
  @methodOf Engine#
  @event
  @params {PixieCanvas} canvas A reference to the canvas to draw on.
  */
  /**
  Called after the engine draws on the canvas. The current camera transform is applied.

  <code><pre>
  engine.bind "draw", (canvas) ->
    # print some directions for the player
    canvas.drawText
      text: "Go this way =>"
      x: 200
      y: 200 
  </pre></code>

  @name draw
  @methodOf Engine#
  @event
  @params {PixieCanvas} canvas A reference to the canvas to draw on.
  */
  /**
  Called after the engine draws.

  The current camera transform is not applied. This is great for
  adding overlays.

  <code><pre>
  engine.bind "overlay", (canvas) ->
    # print the player's health. This will be
    # positioned absolutely according to the viewport.
    canvas.drawText
      text: "HEALTH:"
      position: Point(20, 20)

    canvas.drawText
      text: player.health()
      position: Point(50, 20)
  </pre></code>

  @name overlay
  @methodOf Engine#
  @event
  @params {PixieCanvas} canvas A reference to the canvas to draw on. 
  */
  Engine = function(I) {
    var animLoop, defaultModules, draw, frameAdvance, lastStepTime, modules, queuedObjects, running, self, startTime, step, update;
    I || (I = {});
    Object.reverseMerge(I, {
      objects: []
    }, defaults);
    frameAdvance = false;
    queuedObjects = [];
    running = false;
    startTime = +new Date();
    lastStepTime = -Infinity;
    animLoop = function(timestamp) {
      var delta, msPerFrame, remainder;
      timestamp || (timestamp = +new Date());
      msPerFrame = 1000 / I.FPS;
      delta = timestamp - lastStepTime;
      remainder = delta - msPerFrame;
      if (remainder > 0) {
        lastStepTime = timestamp - Math.min(remainder, msPerFrame);
        step();
      }
      if (running) {
        return window.requestAnimationFrame(animLoop);
      }
    };
    update = function() {
      var toRemove, _ref;
      if (typeof updateKeys === "function") {
        updateKeys();
      }
      self.trigger("update");
      _ref = I.objects.partition(function(object) {
        return object.update();
      }), I.objects = _ref[0], toRemove = _ref[1];
      toRemove.invoke("trigger", "remove");
      I.objects = I.objects.concat(queuedObjects);
      queuedObjects = [];
      return self.trigger("afterUpdate");
    };
    draw = function() {
      if (!I.canvas) {
        return;
      }
      if (I.clear) {
        I.canvas.clear();
      } else if (I.backgroundColor) {
        I.canvas.fill(I.backgroundColor);
      }
      I.canvas.withTransform(I.cameraTransform, function(canvas) {
        var drawObjects;
        self.trigger("beforeDraw", canvas);
        if (I.zSort) {
          drawObjects = I.objects.copy().sort(function(a, b) {
            return a.I.zIndex - b.I.zIndex;
          });
        } else {
          drawObjects = I.objects;
        }
        drawObjects.invoke("draw", canvas);
        return self.trigger("draw", I.canvas);
      });
      return self.trigger("overlay", I.canvas);
    };
    step = function() {
      if (!I.paused || frameAdvance) {
        update();
        I.age += 1;
      }
      return draw();
    };
    self = Core(I).extend({
      /**
      The add method creates and adds an object to the game world. Two
      other events are triggered around this one: beforeAdd and afterAdd.

      <code><pre>
      # you can add arbitrary entityData and
      # the engine will make it into a GameObject
      engine.add 
        x: 50
        y: 30
        color: "red"

      player = engine.add
        class: "Player"
      </pre></code>

      @name add
      @methodOf Engine#
      @param {Object} entityData The data used to create the game object.
      @returns {GameObject}
      */
      add: function(entityData) {
        var obj;
        self.trigger("beforeAdd", entityData);
        obj = GameObject.construct(entityData);
        self.trigger("afterAdd", obj);
        if (running && !I.paused) {
          queuedObjects.push(obj);
        } else {
          I.objects.push(obj);
        }
        return obj;
      },
      objectAt: function(x, y) {
        var bounds, targetObject;
        targetObject = null;
        bounds = {
          x: x,
          y: y,
          width: 1,
          height: 1
        };
        self.eachObject(function(object) {
          if (object.collides(bounds)) {
            return targetObject = object;
          }
        });
        return targetObject;
      },
      eachObject: function(iterator) {
        return I.objects.each(iterator);
      },
      /**
      Start the game simulation.

      <code><pre>
      engine.start()
      </pre></code>

      @methodOf Engine#
      @name start
      */
      start: function() {
        if (!running) {
          running = true;
          return window.requestAnimationFrame(animLoop);
        }
      },
      /**
      Stop the simulation.

      <code><pre>
      engine.stop()
      </pre></code>

      @methodOf Engine#
      @name stop
      */
      stop: function() {
        return running = false;
      },
      /**
      Pause the game and step through 1 update of the engine.

      <code><pre>
      engine.frameAdvance()
      </pre></code>

      @methodOf Engine#
      @name frameAdvance
      */
      frameAdvance: function() {
        I.paused = true;
        frameAdvance = true;
        step();
        return frameAdvance = false;
      },
      /**
      Resume the game.

      <code><pre>
      engine.play()
      </pre></code>

      @methodOf Engine#
      @name play
      */
      play: function() {
        return I.paused = false;
      },
      /**
      Pause the simulation.

      <code><pre>
      engine.pause()
      </pre></code>

      @methodOf Engine#
      @name pause
      */
      pause: function() {
        return I.paused = true;
      },
      /**
      Query the engine to see if it is paused.

      <code><pre>
         engine.pause()

         engine.paused()
      => true

         engine.play()

         engine.paused()
      => false
      </pre></code>

      @methodOf Engine#
      @name paused
      */
      paused: function() {
        return I.paused;
      },
      /**
      Change the framerate of the game. The default framerate is 30 fps.

      <code><pre>
      engine.setFramerate(60)
      </pre></code>

      @methodOf Engine#
      @name setFramerate
      */
      setFramerate: function(newFPS) {
        I.FPS = newFPS;
        self.stop();
        return self.start();
      },
      update: update,
      draw: draw
    });
    self.attrAccessor("ambientLight", "backgroundColor", "cameraTransform", "clear");
    self.include(Bindable);
    defaultModules = ["Delay", "SaveState", "Selector", "Collision"];
    modules = defaultModules.concat(I.includedModules);
    modules = modules.without([].concat(I.excludedModules));
    modules.each(function(moduleName) {
      if (!Engine[moduleName]) {
        throw "#Engine." + moduleName + " is not a valid engine module";
      }
      return self.include(Engine[moduleName]);
    });
    self.trigger("init");
    return self;
  };
  return (typeof exports !== "undefined" && exports !== null ? exports : this)["Engine"] = Engine;
})();;
Engine.Camera = function(I, self) {
  var currentObject, currentOptions, currentType, followTypes;
  currentType = "centered";
  currentOptions = {};
  currentObject = null;
  followTypes = {
    centered: function(object, options) {
      return Matrix.translation(App.width / 2 - object.I.x, App.height / 2 - object.I.y);
    }
  };
  self.bind("afterUpdate", function() {
    if (currentObject) {
      return I.cameraTransform = followTypes[currentType](currentObject, currentOptions);
    }
  });
  return {
    follow: function(object, type, options) {
      currentObject = object;
      currentType = type;
      return currentOptions = options;
    }
  };
};;
/**
The <code>Collision</code> module provides some simple collision detection methods to engine.

@name Collision
@fieldOf Engine
@module
@param {Object} I Instance variables
@param {Object} self Reference to the engine
*/Engine.Collision = function(I, self) {
  return {
    /**
    Detects collisions between a bounds and the game objects.

    @name collides
    @methodOf Engine#
    @param bounds The bounds to check collisions with.
    @param [sourceObject] An object to exclude from the results.
    @returns {Boolean} true if the bounds object collides with any of the game objects, false otherwise.
    */
    collides: function(bounds, sourceObject) {
      return I.objects.inject(false, function(collided, object) {
        return collided || (object.solid() && (object !== sourceObject) && object.collides(bounds));
      });
    },
    /**
    Detects collisions between a bounds and the game objects. 
    Returns an array of objects colliding with the bounds provided.

    @name collidesWith
    @methodOf Engine#
    @param bounds The bounds to check collisions with.
    @param [sourceObject] An object to exclude from the results.
    @returns {Array} An array of objects that collide with the given bounds.
    */
    collidesWith: function(bounds, sourceObject) {
      var collided;
      collided = [];
      I.objects.each(function(object) {
        if (!object.solid()) {
          return;
        }
        if (object !== sourceObject && object.collides(bounds)) {
          return collided.push(object);
        }
      });
      if (collided.length) {
        return collided;
      }
    },
    /**
    Detects collisions between a ray and the game objects.

    @name rayCollides
    @methodOf Engine#
    @param source The origin point
    @param direction A point representing the direction of the ray
    @param [sourceObject] An object to exclude from the results.
    */
    rayCollides: function(source, direction, sourceObject) {
      var hits, nearestDistance, nearestHit;
      hits = I.objects.map(function(object) {
        var hit;
        hit = object.solid() && (object !== sourceObject) && Collision.rayRectangle(source, direction, object.centeredBounds());
        if (hit) {
          hit.object = object;
        }
        return hit;
      });
      nearestDistance = Infinity;
      nearestHit = null;
      hits.each(function(hit) {
        var d;
        if (hit && (d = hit.distance(source)) < nearestDistance) {
          nearestDistance = d;
          return nearestHit = hit;
        }
      });
      return nearestHit;
    }
  };
};;
/**
The <code>Delay</code> module provides methods to trigger events after a number of steps have passed.

@name Delay
@fieldOf Engine
@module
@param {Object} I Instance variables
@param {Object} self Reference to the engine
*/Engine.Delay = function(I, self) {
  var delayedEvents;
  delayedEvents = [];
  self.bind('afterUpdate', function() {
    var firingEvents, _ref;
    _ref = delayedEvents.partition(function(event) {
      return (event.delay -= 1) >= 0;
    }), delayedEvents = _ref[0], firingEvents = _ref[1];
    firingEvents.each(function(event) {
      return event.callback();
    });
  });
  return {
    /**
    Execute a callback after a number of steps have passed.

    <code><pre>
    engine.delay 5, ->

    </pre></code>

    @name delay
    @methodOf Engine#
    @param {Number} steps The number of steps to wait before executing the callback
    @param {Function} callback The callback to be executed.

    @returns {Engine} self
    */
    delay: function(steps, callback) {
      delayedEvents.push({
        delay: steps,
        callback: callback
      });
      return self;
    }
  };
};;
/**
The <code>SaveState</code> module provides methods to save and restore the current engine state.

@name SaveState
@fieldOf Engine
@module
@param {Object} I Instance variables
@param {Object} self Reference to the engine
*/Engine.SaveState = function(I, self) {
  var savedState;
  savedState = null;
  return {
    rewind: function() {},
    /**
    Save the current game state and returns a JSON object representing that state.

    <code><pre>
    engine.bind 'step', ->
      if justPressed.s
        engine.saveState()
    </pre></code>

    @name saveState
    @methodOf Engine#
    @returns {Array} An array of the instance data of all objects in the game
    */
    saveState: function() {
      return savedState = I.objects.map(function(object) {
        return Object.extend({}, object.I);
      });
    },
    /**
    Loads the game state passed in, or the last saved state, if any.

    <code><pre>
    engine.bind 'step', ->
      if justPressed.l
        # loads the last saved state
        engine.loadState()

      if justPressed.o
        # removes all game objects, then reinstantiates 
        # them with the entityData passed in
        engine.loadState([{x: 40, y: 50, class: "Player"}, {x: 0, y: 0, class: "Enemy"}, {x: 500, y: 400, class: "Boss"}])
    </pre></code>

    @name loadState
    @methodOf Engine#
    @param [newState] The game state to load.
    */
    loadState: function(newState) {
      if (newState || (newState = savedState)) {
        I.objects.invoke("trigger", "remove");
        I.objects = [];
        return newState.each(function(objectData) {
          return self.add(Object.extend({}, objectData));
        });
      }
    },
    /**
    Reloads the current engine state, useful for hotswapping code.

    <code><pre>
    engine.I.objects.each (object) ->
      # bring all objects to (0, 0) for some reason
      object.I.x = 0
      object.I.y = 0

    # reload all objects to make sure
    # they are at (0, 0)  
    engine.reload()
    </pre></code>

    @name reload
    @methodOf Engine#
    */
    reload: function() {
      var oldObjects;
      oldObjects = I.objects;
      I.objects = [];
      return oldObjects.each(function(object) {
        object.trigger("remove");
        return self.add(object.I);
      });
    }
  };
};;
/**
The <code>Selector</code> module provides methods to query the engine to find game objects.

@name Selector
@fieldOf Engine
@module
@param {Object} I Instance variables
@param {Object} self Reference to the engine
*/Engine.Selector = function(I, self) {
  var instanceMethods;
  instanceMethods = {
    set: function(attr, value) {
      return this.each(function(item) {
        return item.I[attr] = value;
      });
    }
  };
  return {
    /**
    Get a selection of GameObjects that match the specified selector criteria. The selector language
    can select objects by id, class, or attributes. Note that this method always returns an Array,
    so if you are trying to find only one object you will need something like <code>engine.find("Enemy").first()</code>.

    <code><pre>
    player = engine.add
      class: "Player"

    enemy = engine.add
      class: "Enemy"
      speed: 5
      x: 0

    distantEnemy = engine.add
      class "Enemy"
      x: 500

    boss = engine.add
      class: "Enemy"
      id: "Boss"
      x: 0

    # to select an object by id use "#anId"
    engine.find "#Boss"
    # => [boss]

    # to select an object by class use "MyClass"
    engine.find "Enemy"
    # => [enemy, distantEnemy, boss]

    # to select an object by properties use ".someProperty" or ".someProperty=someValue"
    engine.find ".speed=5"
    # => [enemy]

    # You may mix and match selectors.
    engine.find "Enemy.x=0"
    # => [enemy, boss] # doesn't return distantEnemy
    </pre></code>

    @name find
    @methodOf Engine#
    @param {String} selector
    @returns {Array} An array of the objects found
    */
    find: function(selector) {
      var matcher, results;
      results = [];
      matcher = Engine.Selector.generate(selector);
      I.objects.each(function(object) {
        if (matcher.match(object)) {
          return results.push(object);
        }
      });
      return Object.extend(results, instanceMethods);
    }
  };
};
Object.extend(Engine.Selector, {
  parse: function(selector) {
    return selector.split(",").invoke("trim");
  },
  process: function(item) {
    var result;
    result = /^(\w+)?#?([\w\-]+)?\.?([\w\-]+)?=?([\w\-]+)?/.exec(item);
    if (result) {
      if (result[4]) {
        result[4] = result[4].parse();
      }
      return result.splice(1);
    } else {
      return [];
    }
  },
  generate: function(selector) {
    var ATTR, ATTR_VALUE, ID, TYPE, components;
    components = Engine.Selector.parse(selector).map(function(piece) {
      return Engine.Selector.process(piece);
    });
    TYPE = 0;
    ID = 1;
    ATTR = 2;
    ATTR_VALUE = 3;
    return {
      match: function(object) {
        var attr, attrMatch, component, idMatch, typeMatch, value, _i, _len;
        for (_i = 0, _len = components.length; _i < _len; _i++) {
          component = components[_i];
          idMatch = (component[ID] === object.I.id) || !component[ID];
          typeMatch = (component[TYPE] === object.I["class"]) || !component[TYPE];
          if (attr = component[ATTR]) {
            if ((value = component[ATTR_VALUE]) != null) {
              attrMatch = object.I[attr] === value;
            } else {
              attrMatch = object.I[attr];
            }
          } else {
            attrMatch = true;
          }
          if (idMatch && typeMatch && attrMatch) {
            return true;
          }
        }
        return false;
      }
    };
  }
});;
/**
The <code>Stats</code> module provides methods to query the engine to find game objects.

@name Stats
@fieldOf Engine
@module
@param {Object} I Instance variables
@param {Object} self Reference to the engine
*/Engine.Stats = function(I, self) {
  return {
    measure: function(objects, field, frequency) {
      if (frequency == null) {
        frequency = 30;
      }
    },
    gatherData: function() {
      return self.find();
    }
  };
};;
/**
The default base class for all objects you can add to the engine.

GameObjects fire events that you may bind listeners to. Event listeners 
may be bound with <code>object.bind(eventName, callback)</code>

@name GameObject
@extends Core
@constructor
@instanceVariables age, active, created, destroyed, solid, includedModules, excludedModules
*/
/**
Triggered when the object is created.

<code><pre>
enemyCount = 0

enemy = engine.add
  class: "Enemy"

enemy.bind 'create', ->
  enemyCount++
</pre></code>

@name create
@methodOf GameObject#
@event
*/
/**
Triggered when object is destroyed. Use 
the destroy event to add particle effects, play sounds, etc.

<code><pre>
bomb = GameObject()

bomb.bind 'destroy', ->
  bomb.explode()
  Sound.play "Kaboom"
</pre></code>

@name destroy
@methodOf GameObject#
@event
*/
/**
Triggered during every update step.

<code><pre>
player = GameObject()

player.bind 'step', ->
  # check to see if keys are being pressed and 
  # change the player's velocity
  if keydown.left
    player.velocity(Point(-1, 0))
  else if keydown.right
    player.velocity(Point(1, 0))
  else
    player.velocity(Point(0, 0))
</pre></code>

@name step
@methodOf GameObject#
@event
*/
/**
Triggered every update after the <code>step</code> event is triggered.

<code><pre>
player = GameObject()

# we can really use the update and 
# step events almost interchangebly
player.bind 'update', ->
  # check to see if keys are being pressed and 
  # change the player's velocity
  if keydown.left
    player.velocity(Point(-1, 0))
  else if keydown.right
    player.velocity(Point(1, 0))
  else
    player.velocity(Point(0, 0))
</pre></code>

@name update
@methodOf GameObject#
@event
*/
/**
Triggered when the object is removed from
the engine. Use the remove event to handle any clean up.

<code><pre>
boss = GameObject()

boss.bind 'remove', ->
  unlockDoorToLevel2()
</pre></code>

@name remove
@methodOf GameObject#
@event
*/var GameObject;
GameObject = function(I) {
  var autobindEvents, defaultModules, modules, self;
  I || (I = {});
  /**
  @name {Object} I Instance variables 
  @memberOf GameObject#
  */
  Object.reverseMerge(I, {
    age: 0,
    active: true,
    created: false,
    destroyed: false,
    solid: false,
    includedModules: [],
    excludedModules: []
  });
  self = Core(I).extend({
    /**
    Update the game object. This is generally called by the engine.

    @name update
    @methodOf GameObject#
    */
    update: function() {
      if (I.active) {
        self.trigger('step');
        self.trigger('update');
        I.age += 1;
      }
      return I.active;
    },
    /**
    Destroys the object and triggers the destroyed event.

    @name destroy
    @methodOf GameObject#
    */
    destroy: function() {
      if (!I.destroyed) {
        self.trigger('destroy');
      }
      I.destroyed = true;
      return I.active = false;
    }
  });
  defaultModules = [Bindable, Bounded, Drawable, Durable];
  modules = defaultModules.concat(I.includedModules.invoke('constantize'));
  modules = modules.without(I.excludedModules.invoke('constantize'));
  modules.each(function(Module) {
    return self.include(Module);
  });
  self.attrAccessor("solid");
  autobindEvents = ['create', 'destroy', 'step'];
  autobindEvents.each(function(eventName) {
    var event;
    if (event = I[eventName]) {
      if (typeof event === "function") {
        return self.bind(eventName, event);
      } else {
        return self.bind(eventName, eval("(function() {" + event + "})"));
      }
    }
  });
  if (!I.created) {
    self.trigger('create');
  }
  I.created = true;
  return self;
};
/**
Construct an object instance from the given entity data.
@name construct
@memberOf GameObject
@param {Object} entityData
*/
GameObject.construct = function(entityData) {
  if (entityData["class"]) {
    return entityData["class"].constantize()(entityData);
  } else {
    return GameObject(entityData);
  }
};;
/**
The Movable module automatically updates the position and velocity of
GameObjects based on the velocity and acceleration. It does not check
collisions so is probably best suited to particle effect like things.

<code><pre>
player = GameObject
  x: 0
  y: 0
  velocity: Point(0, 0)
  acceleration: Point(1, 0)
  maxSpeed: 2

player.include(Movable)

# => `velocity is {x: 0, y: 0} and position is {x: 0, y: 0}`

player.update()
# => `velocity is {x: 1, y: 0} and position is {x: 1, y: 0}` 

player.update()
# => `velocity is {x: 2, y: 0} and position is {x: 3, y: 0}`   

# we've hit our maxSpeed so our velocity won't increase
player.update()
# => `velocity is {x: 2, y: 0} and position is {x: 5, y: 0}`
</pre></code>

@name Movable
@module
@constructor
@param {Object} I Instance variables
@param {Core} self Reference to including object
*/var Movable;
Movable = function(I) {
  Object.reverseMerge(I, {
    acceleration: Point(0, 0),
    velocity: Point(0, 0)
  });
  I.acceleration = Point(I.acceleration.x, I.acceleration.y);
  I.velocity = Point(I.velocity.x, I.velocity.y);
  return {
    before: {
      update: function() {
        var currentSpeed;
        I.velocity = I.velocity.add(I.acceleration);
        if (I.maxSpeed != null) {
          currentSpeed = I.velocity.magnitude();
          if (currentSpeed > I.maxSpeed) {
            I.velocity = I.velocity.scale(I.maxSpeed / currentSpeed);
          }
        }
        I.x += I.velocity.x;
        return I.y += I.velocity.y;
      }
    }
  };
};;
/**
@name ResourceLoader
@namespace

Helps access the assets in your game.
*/(function() {
  var ResourceLoader, typeTable;
  typeTable = {
    images: "png"
  };
  ResourceLoader = {
    /**
      Return the url for a particular asset.

      <code><pre>
      ResourceLoader.urlFor("images", "player")
      # => This returns the url for the file "player.png" in your images directory.
      </pre></code>

      @name urlFor
      @methodOf ResourceLoader#
      @param {String} directory The directory your file is in.
      @param {String} name The name of the file.
      @returns {String} The full url of your asset

      */
    urlFor: function(directory, name) {
      var type, _ref;
      directory = (typeof App !== "undefined" && App !== null ? (_ref = App.directories) != null ? _ref[directory] : void 0 : void 0) || directory;
      type = typeTable[directory];
      return "" + BASE_URL + "/" + directory + "/" + name + "." + type + "?" + MTIME;
    }
  };
  return (typeof exports !== "undefined" && exports !== null ? exports : this)["ResourceLoader"] = ResourceLoader;
})();;
/**
The Rotatable module rotates the object
based on its rotational velocity.

<code><pre>
player = GameObject
  x: 0
  y: 0
  rotationalVelocity: Math.PI / 64

player.include(Rotatable)

player.I.rotation
# => 0

player.update()

player.I.rotation
# => 0.04908738521234052 # Math.PI / 64

player.update()

player.I.rotation
# => 0.09817477042468103 # 2 * (Math.PI / 64)
</pre></code>

@name Rotatable
@module
@constructor
@param {Object} I Instance variables
@param {Core} self Reference to including object
*/var Rotatable;
Rotatable = function(I) {
  I || (I = {});
  Object.reverseMerge(I, {
    rotation: 0,
    rotationalVelocity: 0
  });
  return {
    before: {
      update: function() {
        return I.rotation += I.rotationalVelocity;
      }
    }
  };
};;
/**
The Sprite class provides a way to load images for use in games.

By default, images are loaded asynchronously. A proxy object is 
returned immediately. Even though it has a draw method it will not
draw anything to the screen until the image has been loaded.

@name Sprite
@constructor
*/(function() {
  var LoaderProxy, Sprite;
  LoaderProxy = function() {
    return {
      draw: function() {},
      fill: function() {},
      frame: function() {},
      update: function() {},
      width: null,
      height: null
    };
  };
  Sprite = function(image, sourceX, sourceY, width, height) {
    sourceX || (sourceX = 0);
    sourceY || (sourceY = 0);
    width || (width = image.width);
    height || (height = image.height);
    return {
      /**
      Draw this sprite on the given canvas at the given position.

      @name draw
      @methodOf Sprite#
      @param {PowerCanvas} canvas Reference to the canvas to draw the sprite on
      @param {Number} x Position on the x axis to draw the sprite
      @param {Number} y Position on the y axis to draw the sprite
      */
      draw: function(canvas, x, y) {
        return canvas.drawImage(image, sourceX, sourceY, width, height, x, y, width, height);
      },
      fill: function(canvas, x, y, width, height, repeat) {
        var pattern;
        if (repeat == null) {
          repeat = "repeat";
        }
        pattern = canvas.createPattern(image, repeat);
        return canvas.drawRect({
          x: x,
          y: y,
          width: width,
          height: height,
          color: pattern
        });
      },
      width: width,
      height: height
    };
  };
  /**
  Loads all sprites from a sprite sheet found in
  your images directory, specified by the name passed in.

  @name loadSheet
  @methodOf Sprite
  @param {String} name Name of the spriteSheet image in your images directory
  @param {Number} tileWidth Width of each sprite in the sheet
  @param {Number} tileHeight Height of each sprite in the sheet
  @returns {Array} An array of sprite objects
  */
  Sprite.loadSheet = function(name, tileWidth, tileHeight) {
    var image, sprites, url;
    url = ResourceLoader.urlFor("images", name);
    sprites = [];
    image = new Image();
    image.onload = function() {
      var imgElement;
      imgElement = this;
      return (image.height / tileHeight).times(function(row) {
        return (image.width / tileWidth).times(function(col) {
          return sprites.push(Sprite(imgElement, col * tileWidth, row * tileHeight, tileWidth, tileHeight));
        });
      });
    };
    image.src = url;
    return sprites;
  };
  /**
  Loads a sprite from a given url.

  @name load
  @methodOf Sprite
  @param {String} url
  @param {Function} [loadedCallback]
  @returns {Sprite} A sprite object
  */
  Sprite.load = function(url, loadedCallback) {
    var img, proxy;
    img = new Image();
    proxy = LoaderProxy();
    img.onload = function() {
      var tile;
      tile = Sprite(this);
      Object.extend(proxy, tile);
      if (loadedCallback) {
        return loadedCallback(proxy);
      }
    };
    img.src = url;
    return proxy;
  };
  /**
  Loads a sprite with the given pixie id.

  @name fromPixieId
  @methodOf Sprite
  @param {Number} id Pixie Id of the sprite to load
  @param {Function} [callback] Function to execute once the image is loaded. The sprite proxy data is passed to this as a parameter.
  @returns {Sprite}
  */
  Sprite.fromPixieId = function(id, callback) {
    return Sprite.load("http://pixieengine.com/s3/sprites/" + id + "/original.png", callback);
  };
  /**
  A sprite that draws nothing.

  @name EMPTY
  @fieldOf Sprite
  @constant
  @returns {Sprite}
  */
  /**
  A sprite that draws nothing.

  @name NONE
  @fieldOf Sprite
  @constant
  @returns {Sprite}
  */
  Sprite.EMPTY = Sprite.NONE = LoaderProxy();
  /**
  Loads a sprite from a given url.

  @name fromURL
  @methodOf Sprite
  @param {String} url The url where the image to load is located
  @param {Function} [callback] Function to execute once the image is loaded. The sprite proxy data is passed to this as a parameter.
  @returns {Sprite}
  */
  Sprite.fromURL = Sprite.load;
  /**
  Loads a sprite with the given name.

  @name loadByName
  @methodOf Sprite
  @param {String} name The name of the image in your images directory
  @param {Function} [callback] Function to execute once the image is loaded. The sprite proxy data is passed to this as a parameter.
  @returns {Sprite}
  */
  Sprite.loadByName = function(name, callback) {
    return Sprite.load(ResourceLoader.urlFor("images", name), callback);
  };
  return (typeof exports !== "undefined" && exports !== null ? exports : this)["Sprite"] = Sprite;
})();;
;
