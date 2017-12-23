import * as jwtDecode from 'jwt-decode'
import * as jwt from 'jsonwebtoken'
import * as jwksClient from 'jwks-rsa'

const jwks = jwksClient({
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 10, // Default value
  jwksUri: 'https://bgz.auth0.com/.well-known/jwks.json',
})

let publicKey =
  '-----BEGIN CERTIFICATE-----\nMIIC9TCCAd2gAwIBAgIJIUIi8lAitvB7MA0GCSqGSIb3DQEBCwUAMBgxFjAUBgNV\nBAMTDWJnei5hdXRoMC5jb20wHhcNMTcxMTI0MTk0ODA4WhcNMzEwODAzMTk0ODA4\nWjAYMRYwFAYDVQQDEw1iZ3ouYXV0aDAuY29tMIIBIjANBgkqhkiG9w0BAQEFAAOC\nAQ8AMIIBCgKCAQEA0t//04WrcR7wygvpS5CjGwZxTIaNlblkUO+/frEmjPFexdZE\nNPhMO22WMBl3lbHHnjiRflxbQ8dkSGs9Z65qGMwnqmG2LuJ2tWkQpib/HC49EHNx\nFl1ssdHIlzfcvlV5c6ANb4V3X2Yk7kWPfnr2BrRrrvaFLWXEJfiV8HbIIv9PW54k\nQ1ISCXcGLoHC/AUvw29tqysxjuWARN5k89OEcC5jsAQHYPg+dN7TuuhVhvESkhAT\n+pc6r8iDz6YNEnJ2fw/xDmW60fHKbtTtIoxiTTrWOz+alvzxufGw3lYUFBdFgzxH\nfVT6g8UNSkv3cQThWcWu7tIAlkO7tAWsgWSj8QIDAQABo0IwQDAPBgNVHRMBAf8E\nBTADAQH/MB0GA1UdDgQWBBRP5q2+QevyDdP78Ya6d1Qr2l+TczAOBgNVHQ8BAf8E\nBAMCAoQwDQYJKoZIhvcNAQELBQADggEBAA0QIjqGbLk3QN1RB3Ii/Rib+BaKnCLK\nR143Rc6F16hfNqtNSix1iBM8p1NcYmrb/ts9YtAzGw/QVZOhkz0kK1Y3MiLDMJeL\nFt3sigkpviKw6vcNtde2WMxLIrf6pHqVvwa/9mOZQjEt4hP2jglBsZmYJG8rRskd\nHUfeLsQtPl6egnj7nqU/QbgOuoT32YSE0g0NWKr/G78I9JI8meFWldPKBi9pU64/\np63DBEHqRH5QMdyJ72qc3aHGAQIkhARYd0cYaamtouokQcrlDK96A6+S2MeDGE+L\nlJeneacHKUDeCzSuVOs5YDuqb2SMwsGJRct1C4M5SvUaUGNUylveMQE=\n-----END CERTIFICATE-----\n'

export const decodeToken = (token: string) => jwt.verify(token, publicKey, {algorithms: ['RS256']})
