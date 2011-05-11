module "Engine"

test "#play, #pause, and #paused", ->
  engine = Engine()

  equal engine.paused(), false
  engine.pause()
  equal engine.paused(), true
  engine.play()
  equal engine.paused(), false

test "#save and #restore", ->
  engine = Engine()

  engine.add {}
  engine.add {}

  equals(engine.objects().length, 2)

  engine.saveState()

  engine.add {}

  equals(engine.objects().length, 3)

  engine.loadState()

  equals(engine.objects().length, 2)

test "before add event", 1, ->
  engine = Engine()

  engine.bind "beforeAdd", (data) ->
    equals data.test, "test"

  engine.add
    test: "test"

test "invalid module throws error", ->
  raises ->
    engine = Engine
      includedModules: ["HellaInvalidModule"]

test "draw events", 2, ->
  engine = Engine()

  engine.bind "preDraw", ->
    ok true

  engine.bind "draw", ->
    ok true

  engine.frameAdvance()

test "Remove event", 1, ->
  engine = Engine()

  object = engine.add
    active: false

  object.bind "remove", ->
    ok true, "remove called"

  engine.frameAdvance()

test "#find", ->
  engine = Engine()

  engine.add
    id: "testy"

  engine.add
    test: true

  engine.add
    solid: true
    opaque: false

  equal engine.find("#no_testy").length, 0
  equal engine.find("#testy").length, 1
  equal engine.find(".test").length, 1
  equal engine.find(".solid=true").length, 1
  equal engine.find(".opaque=false").length, 1

test "Selector.parse", ->
  a = Engine.Selector.parse("#foo")
  equal a.length, 1
  equal a.first(), "#foo"

  a = Engine.Selector.parse("#boo, baz")
  equal a.length, 2
  equal a.first(), "#boo"
  equal a.last(), "baz"

  a = Engine.Selector.parse("#boo,Light.flicker,baz")
  equal a.length, 3
  equal a.first(), "#boo"
  equal a[1], "Light.flicker"
  equal a.last(), "baz"

test "Selector.process", ->
  [type, id, attr, value] = Engine.Selector.process("Foo#test.cool=1")

  equal type, "Foo"
  equal id, "test"
  equal attr, "cool"
  equal value, 1

  [type, id, attr, value] = Engine.Selector.process(".baz=false")

  equal type, undefined
  equal id, undefined
  equal attr, "baz"
  equal value, false

asyncTest "Running", ->
  fps = 33.33
  milliseconds = 1000

  engine = Engine
    FPS: fps

  engine.start()

  setTimeout ->
    engine.stop()
    age = engine.I.age
    ok(30 <= age <= 36, "Engine ran #{age} steps in #{milliseconds}ms")

    start()
  , milliseconds

module()

