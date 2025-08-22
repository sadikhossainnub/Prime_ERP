import { NativeModules } from 'react-native';
const { AntiSpoofing } = NativeModules

export type AntiResult = { vpn: boolean; mockLocation: boolean; rooted: boolean }

export async function checkAntiSpoof(): Promise<AntiResult> {
  if (!AntiSpoofing?.detect) return { vpn: false, mockLocation: false, rooted: false }
  try {
    const res = await AntiSpoofing.detect()
    return { vpn: !!res?.vpn, mockLocation: !!res?.mockLocation, rooted: !!res?.rooted }
  } catch {
    return { vpn: false, mockLocation: false, rooted: false }
  }
}
