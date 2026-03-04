import type { UnifiedUserData } from '../types/unified-events'

export class UserData {
  private data: UnifiedUserData = {}

  setEmail(email: string): this {
    this.data.email = email
    return this
  }

  setPhone(phone: string): this {
    this.data.phone = phone
    return this
  }

  setFirstName(firstName: string): this {
    this.data.firstName = firstName
    return this
  }

  setLastName(lastName: string): this {
    this.data.lastName = lastName
    return this
  }

  setClientIpAddress(ip: string): this {
    this.data.ip = ip
    return this
  }

  setClientUserAgent(userAgent: string): this {
    this.data.userAgent = userAgent
    return this
  }

  setExternalId(externalId: string): this {
    this.data.externalId = externalId
    return this
  }

  setCity(city: string): this {
    this.data.city = city
    return this
  }

  setState(state: string): this {
    this.data.state = state
    return this
  }

  setZipCode(zipCode: string): this {
    this.data.zipCode = zipCode
    return this
  }

  setCountry(country: string): this {
    this.data.country = country
    return this
  }

  setBirthDate(birthDate: string): this {
    this.data.birthDate = birthDate
    return this
  }

  setGender(gender: 'm' | 'f'): this {
    this.data.gender = gender
    return this
  }

  setGaClientId(gaClientId: string): this {
    this.data.gaClientId = gaClientId
    return this
  }

  setFbp(fbp: string): this {
    this.data.fbp = fbp
    return this
  }

  setFbc(fbc: string): this {
    this.data.fbc = fbc
    return this
  }

  setGclid(gclid: string): this {
    this.data.gclid = gclid
    return this
  }

  setDeviceId(deviceId: string): this {
    this.data.deviceId = deviceId
    return this
  }

  toUnifiedUserData(): UnifiedUserData {
    return { ...this.data }
  }
}
