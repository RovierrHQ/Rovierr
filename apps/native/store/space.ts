import { atom } from 'jotai'

export const currentSpaceAtom = atom<
  'academics' | 'personal' | 'societies' | 'career'
>('academics')
