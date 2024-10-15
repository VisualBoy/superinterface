import { createRoot } from 'react-dom/client'
import {
  AudioThreadDialog,
} from '@superinterface/react'
import { Providers } from '@/components/Providers'

const element = document.createElement('div')
element.classList.add('superinterface')
document.body.appendChild(element)

const root = createRoot(element)

root.render(
  <Providers>
    <AudioThreadDialog />
  </Providers>
)
