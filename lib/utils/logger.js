import { Chalk } from 'chalk'
import { makeTaggedTemplate } from 'chalk-template'

export class Logger {
  /** @type {String} */ #component
  /** @type {(template: TemplateStringsArray, ...placeholders: unknown[]) => string} */ #template

  static logger = new Logger()

  /**
   * Initializes the logger
   * @param {String} component
   */
  constructor(component = '') {
    this.#component = component
    this.#template = makeTaggedTemplate(new Chalk())
  }

  #header(level, color) {
    let template = this.#template
    let component = this.#component
    return template`{bg${color}.underline.bold ${level}${
      component !== '' ? `[${component}]` : ''
    }:}`
  }

  /**
   * @param {String} color
   * @param {String} message
   * @returns
   */
  #message(level, color, message) {
    let template = this.#template
    return template`${this.#header(level, color)} ${message}`
  }

  /**
   * @param {string} message
   * @param  {...any} optionalParams
   */
  info(message, ...optionalParams) {
    console.debug(this.#message('debug', 'Blue', message), ...optionalParams)
  }

  /**
   * @param {string} message
   * @param  {...any} optionalParams
   */
  assert(message, ...optionalParams) {
    console.assert(this.#message('debug', 'Magenta', message), ...optionalParams)
  }

  /**
   * @param {string} message
   * @param  {...any} optionalParams
   */
  debug(message, ...optionalParams) {
    console.debug(this.#message('debug', 'Black', message), ...optionalParams)
  }

  /**
   * @param {string} message
   * @param  {...any} optionalParams
   */
  log(message, ...optionalParams) {
    console.log(this.#message('log', 'Gray', message), ...optionalParams)
  }

  /**
   * @param {string} message
   * @param  {...any} optionalParams
   */
  warn(message, ...optionalParams) {
    console.warn(this.#message('warn', 'Yellow', message), ...optionalParams)
  }

  /**
   * @param {string} message
   * @param  {...any} optionalParams
   */
  error(message, ...optionalParams) {
    console.error(this.#message('error', 'Red', message), ...optionalParams)
  }
}
