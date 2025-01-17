###*
The Sprite class provides a way to load images for use in games.

By default, images are loaded asynchronously. A proxy object is 
returned immediately. Even though it has a draw method it will not
draw anything to the screen until the image has been loaded.

@name Sprite
@constructor
###

( ->
  LoaderProxy = ->
    draw: ->
    fill: ->
    frame: ->
    update: ->
    width: null
    height: null

  Sprite = (image, sourceX, sourceY, width, height) ->
    sourceX ||= 0
    sourceY ||= 0
    width ||= image.width
    height ||= image.height

    ###*
    Draw this sprite on the given canvas at the given position.

    @name draw
    @methodOf Sprite#
    @param {PowerCanvas} canvas Reference to the canvas to draw the sprite on
    @param {Number} x Position on the x axis to draw the sprite
    @param {Number} y Position on the y axis to draw the sprite
    ###
    draw: (canvas, x, y) ->
      canvas.drawImage(
        image,
        sourceX,
        sourceY,
        width,
        height,
        x,
        y,
        width,
        height
      )

    fill: (canvas, x, y, width, height, repeat="repeat") ->
      pattern = canvas.createPattern(image, repeat)
      canvas.drawRect({x, y, width, height, color: pattern})

    width: width
    height: height

  ###*
  Loads all sprites from a sprite sheet found in
  your images directory, specified by the name passed in.

  @name loadSheet
  @methodOf Sprite
  @param {String} name Name of the spriteSheet image in your images directory
  @param {Number} tileWidth Width of each sprite in the sheet
  @param {Number} tileHeight Height of each sprite in the sheet
  @returns {Array} An array of sprite objects
  ###
  Sprite.loadSheet = (name, tileWidth, tileHeight) ->
    url = ResourceLoader.urlFor("images", name)

    sprites = []
    image = new Image()

    image.onload = ->
      imgElement = this
      (image.height / tileHeight).times (row) ->
        (image.width / tileWidth).times (col) ->
          sprites.push(Sprite(imgElement, col * tileWidth, row * tileHeight, tileWidth, tileHeight))

    image.src = url

    return sprites

  ###*
  Loads a sprite from a given url.

  @name load
  @methodOf Sprite
  @param {String} url
  @param {Function} [loadedCallback]
  @returns {Sprite} A sprite object
  ###
  Sprite.load = (url, loadedCallback) ->
    img = new Image()
    proxy = LoaderProxy()

    img.onload = ->
      tile = Sprite(this)

      Object.extend(proxy, tile)

      if loadedCallback
        loadedCallback(proxy)

    img.src = url

    return proxy

  ###*
  Loads a sprite with the given pixie id.

  @name fromPixieId
  @methodOf Sprite
  @param {Number} id Pixie Id of the sprite to load
  @param {Function} [callback] Function to execute once the image is loaded. The sprite proxy data is passed to this as a parameter.
  @returns {Sprite}
  ###
  Sprite.fromPixieId = (id, callback) ->
    Sprite.load("http://pixieengine.com/s3/sprites/#{id}/original.png", callback)

  ###*
  A sprite that draws nothing.

  @name EMPTY
  @fieldOf Sprite
  @constant
  @returns {Sprite}
  ###
  ###*
  A sprite that draws nothing.

  @name NONE
  @fieldOf Sprite
  @constant
  @returns {Sprite}
  ###
  Sprite.EMPTY = Sprite.NONE = LoaderProxy()

  ###*
  Loads a sprite from a given url.

  @name fromURL
  @methodOf Sprite
  @param {String} url The url where the image to load is located
  @param {Function} [callback] Function to execute once the image is loaded. The sprite proxy data is passed to this as a parameter.
  @returns {Sprite}
  ###
  Sprite.fromURL = Sprite.load

  ###*
  Loads a sprite with the given name.

  @name loadByName
  @methodOf Sprite
  @param {String} name The name of the image in your images directory
  @param {Function} [callback] Function to execute once the image is loaded. The sprite proxy data is passed to this as a parameter.
  @returns {Sprite}
  ###
  Sprite.loadByName = (name, callback) ->
    Sprite.load(ResourceLoader.urlFor("images", name), callback)

  (exports ? this)["Sprite"] = Sprite
)()

