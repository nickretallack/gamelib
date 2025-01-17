( ->
  defaults =
    FPS: 30
    age: 0
    ambientLight: 1
    backgroundColor: "#00010D"
    cameraTransform: Matrix.IDENTITY
    clear: false
    excludedModules: []
    includedModules: []
    paused: false
    showFPS: false
    zSort: false

  ###*
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
  ###

  ###*
  Observe or modify the 
  entity data before it is added to the engine.
  @name beforeAdd
  @methodOf Engine#
  @event
  @param {Object} entityData
  ###

  ###*
  Observe or configure a <code>gameObject</code> that has been added 
  to the engine.
  @name afterAdd
  @methodOf Engine#
  @event
  @param {GameObject} object The object that has just been added to the
  engine.
  ###

  ###*
  Called when the engine updates all the game objects.

  @name update
  @methodOf Engine#
  @event
  ###

  ###*
  Called after the engine completes an update. Here it is 
  safe to modify the game objects array.

  @name afterUpdate
  @methodOf Engine#
  @event
  ###

  ###*
  Called before the engine draws the game objects on the canvas. The current camera transform is applied.

  @name beforeDraw
  @methodOf Engine#
  @event
  @params {PixieCanvas} canvas A reference to the canvas to draw on.
  ###

  ###*
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
  ###

  ###*
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
  ###

  Engine = (I) ->
    I ||= {}

    Object.reverseMerge I, {
      objects: []
    }, defaults

    frameAdvance = false

    queuedObjects = []

    running = false
    startTime = +new Date()
    lastStepTime = -Infinity
    animLoop = (timestamp) ->
      timestamp ||= +new Date()
      msPerFrame = (1000 / I.FPS)

      delta = timestamp - lastStepTime
      remainder = delta - msPerFrame

      if remainder > 0
        lastStepTime = timestamp - Math.min(remainder, msPerFrame)
        step()

      if running
        window.requestAnimationFrame(animLoop)

    update = ->
      # TODO: Move this update keys into a keyboard engine module
      # Make a Gamepad/Keyboard input module that has web and XNA
      # implementations
      updateKeys?()

      self.trigger "update"

      [I.objects, toRemove] = I.objects.partition (object) ->
        object.update()

      toRemove.invoke "trigger", "remove"

      I.objects = I.objects.concat(queuedObjects)
      queuedObjects = []

      self.trigger "afterUpdate"

    draw = ->
      return unless I.canvas

      if I.clear
        I.canvas.clear()
      else if I.backgroundColor
        I.canvas.fill(I.backgroundColor)

      I.canvas.withTransform I.cameraTransform, (canvas) ->
        self.trigger "beforeDraw", canvas

        if I.zSort
          drawObjects = I.objects.copy().sort (a, b) ->
            a.I.zIndex - b.I.zIndex
        else
          drawObjects = I.objects

        drawObjects.invoke("draw", canvas)

        self.trigger "draw", I.canvas

      self.trigger "overlay", I.canvas

    step = ->
      if !I.paused || frameAdvance
        update()
        I.age += 1

      draw()

    self = Core(I).extend {
      ###*
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
      ###
      add: (entityData) ->
        self.trigger "beforeAdd", entityData

        obj = GameObject.construct entityData

        self.trigger "afterAdd", obj

        if running && !I.paused
          queuedObjects.push obj
        else
          I.objects.push obj

        return obj

      objectAt: (x, y) ->
        targetObject = null
        bounds =
          x: x
          y: y
          width: 1
          height: 1

        self.eachObject (object) ->
          targetObject = object if object.collides(bounds)

        return targetObject

      eachObject: (iterator) ->
        I.objects.each iterator

      ###*
      Start the game simulation.

      <code><pre>
      engine.start()
      </pre></code>

      @methodOf Engine#
      @name start
      ###
      start: ->
        unless running
          running = true
          window.requestAnimationFrame(animLoop)

      ###*
      Stop the simulation.

      <code><pre>
      engine.stop()
      </pre></code>

      @methodOf Engine#
      @name stop
      ###
      stop: ->
        running = false

      ###*
      Pause the game and step through 1 update of the engine.

      <code><pre>
      engine.frameAdvance()
      </pre></code>

      @methodOf Engine#
      @name frameAdvance
      ###
      frameAdvance: ->
        I.paused = true
        frameAdvance = true
        step()
        frameAdvance = false

      ###*
      Resume the game.

      <code><pre>
      engine.play()
      </pre></code>

      @methodOf Engine#
      @name play
      ###
      play: ->
        I.paused = false

      ###*
      Pause the simulation.

      <code><pre>
      engine.pause()
      </pre></code>

      @methodOf Engine#
      @name pause
      ###
      pause: ->
        I.paused = true

      ###*
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
      ###
      paused: ->
        I.paused

      ###*
      Change the framerate of the game. The default framerate is 30 fps.

      <code><pre>
      engine.setFramerate(60)
      </pre></code>

      @methodOf Engine#
      @name setFramerate
      ###
      setFramerate: (newFPS) ->
        I.FPS = newFPS
        self.stop()
        self.start()

      update: update
      draw: draw
    }

    self.attrAccessor "ambientLight", "backgroundColor", "cameraTransform", "clear"
    self.include Bindable

    defaultModules = ["Delay", "SaveState", "Selector", "Collision"]
    modules = defaultModules.concat(I.includedModules)
    modules = modules.without([].concat(I.excludedModules))

    modules.each (moduleName) ->
      throw "#Engine.#{moduleName} is not a valid engine module" unless Engine[moduleName]

      self.include Engine[moduleName]

    self.trigger "init"

    return self

  (exports ? this)["Engine"] = Engine
)()
