import { useEffect, useRef } from 'react'
import { translateDomText } from './domTranslations'

const IGNORED_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE'])

export default function useDomTranslator(language) {
  const textOriginalMapRef = useRef(new WeakMap())
  const attrOriginalMapRef = useRef(new WeakMap())

  useEffect(() => {
    const textOriginalMap = textOriginalMapRef.current
    const attrOriginalMap = attrOriginalMapRef.current

    const shouldSkipNode = (node) => {
      const parentElement = node?.parentElement
      if (!parentElement) return true
      if (IGNORED_TAGS.has(parentElement.tagName)) return true
      if (parentElement.closest('[data-i18n-ignore="true"]')) return true
      return false
    }

    const translateTextNodes = (root = document.body) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
      let currentNode = walker.nextNode()

      while (currentNode) {
        const textValue = currentNode.nodeValue
        if (!shouldSkipNode(currentNode) && textValue && textValue.trim()) {
          if (!textOriginalMap.has(currentNode)) {
            textOriginalMap.set(currentNode, textValue)
          }

          const originalValue = textOriginalMap.get(currentNode)
          const translatedValue = translateDomText(originalValue, language)
          if (currentNode.nodeValue !== translatedValue) {
            currentNode.nodeValue = translatedValue
          }
        }

        currentNode = walker.nextNode()
      }
    }

    const translatableAttributes = ['placeholder', 'title', 'aria-label']

    const translateAttributes = (root = document.body) => {
      const elements = root.querySelectorAll('[placeholder], [title], [aria-label]')

      elements.forEach((element) => {
        if (element.closest('[data-i18n-ignore="true"]')) return

        let elementOriginals = attrOriginalMap.get(element)
        if (!elementOriginals) {
          elementOriginals = {}
          attrOriginalMap.set(element, elementOriginals)
        }

        translatableAttributes.forEach((attributeName) => {
          const currentAttributeValue = element.getAttribute(attributeName)
          if (!currentAttributeValue) return

          if (!Object.prototype.hasOwnProperty.call(elementOriginals, attributeName)) {
            elementOriginals[attributeName] = currentAttributeValue
          }

          const translatedValue = translateDomText(elementOriginals[attributeName], language)
          if (currentAttributeValue !== translatedValue) {
            element.setAttribute(attributeName, translatedValue)
          }
        })
      })
    }

    const translateAll = (root) => {
      translateTextNodes(root)
      translateAttributes(root)
    }

    translateAll(document.body)

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            translateAll(node)
          } else if (node.nodeType === Node.TEXT_NODE && node.parentElement) {
            translateTextNodes(node.parentElement)
          }
        })
      })
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    })

    return () => {
      observer.disconnect()
    }
  }, [language])
}
