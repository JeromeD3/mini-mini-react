import { describe, expect, it } from 'vitest'
import React from '../React'
describe('createElement', () => {
  it('props is null', () => {
    const el = React.createElement('div', null, 'hi')

    expect(el).toMatchInlineSnapshot(
    `
      {
        "props": {
          "children": [
            {
              "props": {
                "children": [],
                "nodeValue": "hi",
              },
              "type": "TEXT_ELEMENT",
            },
          ],
        },
        "type": "div",
      }
    `)

    // expect(el).toEqual({
    //   type: 'div',
    //   props: {
    //     children: [
    //       {
    //         type: 'TEXT_ELEMENT',
    //         props: {
    //           nodeValue: 'hi',
    //           children: [],
    //         },
    //       },
    //     ],
    //   },
    // })
  })

  /**
   * 有属性的情况下
   */
  it('props should work', () => {
    const el = React.createElement('div', {id:"app"}, 'hi')

    expect(el).toMatchInlineSnapshot(`
      {
        "props": {
          "children": [
            {
              "props": {
                "children": [],
                "nodeValue": "hi",
              },
              "type": "TEXT_ELEMENT",
            },
          ],
          "id": "app",
        },
        "type": "div",
      }
    `)

  })
})
