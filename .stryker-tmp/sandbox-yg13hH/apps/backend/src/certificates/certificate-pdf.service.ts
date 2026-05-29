function stryNS_9fa48() {
  var g = typeof globalThis === 'object' && globalThis && globalThis.Math === Math && globalThis || new Function("return this")();
  var ns = g.__stryker__ || (g.__stryker__ = {});
  if (ns.activeMutant === undefined && g.process && g.process.env && g.process.env.__STRYKER_ACTIVE_MUTANT__) {
    ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__;
  }
  function retrieveNS() {
    return ns;
  }
  stryNS_9fa48 = retrieveNS;
  return retrieveNS();
}
stryNS_9fa48();
function stryCov_9fa48() {
  var ns = stryNS_9fa48();
  var cov = ns.mutantCoverage || (ns.mutantCoverage = {
    static: {},
    perTest: {}
  });
  function cover() {
    var c = cov.static;
    if (ns.currentTestId) {
      c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {};
    }
    var a = arguments;
    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1;
    }
  }
  stryCov_9fa48 = cover;
  cover.apply(null, arguments);
}
function stryMutAct_9fa48(id) {
  var ns = stryNS_9fa48();
  function isActive(id) {
    if (ns.activeMutant === id) {
      if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
        throw new Error('Stryker: Hit count limit reached (' + ns.hitCount + ')');
      }
      return true;
    }
    return false;
  }
  stryMutAct_9fa48 = isActive;
  return isActive(id);
}
import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { Certificate } from './certificate.entity';
@Injectable()
export class CertificatePdfService {
  async generateCertificatePdf(certificate: Certificate, verificationBaseUrl: string): Promise<Buffer> {
    if (stryMutAct_9fa48("1588")) {
      {}
    } else {
      stryCov_9fa48("1588");
      const studentName = stryMutAct_9fa48("1591") ? (certificate.user?.username || certificate.user?.email) && certificate.userId : stryMutAct_9fa48("1590") ? false : stryMutAct_9fa48("1589") ? true : (stryCov_9fa48("1589", "1590", "1591"), (stryMutAct_9fa48("1593") ? certificate.user?.username && certificate.user?.email : stryMutAct_9fa48("1592") ? false : (stryCov_9fa48("1592", "1593"), (stryMutAct_9fa48("1594") ? certificate.user.username : (stryCov_9fa48("1594"), certificate.user?.username)) || (stryMutAct_9fa48("1595") ? certificate.user.email : (stryCov_9fa48("1595"), certificate.user?.email)))) || certificate.userId);
      const courseTitle = stryMutAct_9fa48("1598") ? certificate.course?.title && certificate.courseId : stryMutAct_9fa48("1597") ? false : stryMutAct_9fa48("1596") ? true : (stryCov_9fa48("1596", "1597", "1598"), (stryMutAct_9fa48("1599") ? certificate.course.title : (stryCov_9fa48("1599"), certificate.course?.title)) || certificate.courseId);
      const issuedAt = stryMutAct_9fa48("1600") ? certificate.issuedAt.toISOString() : (stryCov_9fa48("1600"), certificate.issuedAt.toISOString().slice(0, 10));
      const verificationUrl = stryMutAct_9fa48("1601") ? `` : (stryCov_9fa48("1601"), `${verificationBaseUrl}/v1/certificates/verify`);
      const qrPayload = JSON.stringify(stryMutAct_9fa48("1602") ? {} : (stryCov_9fa48("1602"), {
        hash: certificate.certificateHash
      }));

      // Generate QR as PNG buffer
      const qrPng: Buffer = await QRCode.toBuffer(qrPayload, stryMutAct_9fa48("1603") ? {} : (stryCov_9fa48("1603"), {
        width: 120,
        margin: 1
      }));
      return this.buildPdf(stryMutAct_9fa48("1604") ? {} : (stryCov_9fa48("1604"), {
        studentName,
        courseTitle,
        issuedAt,
        verificationUrl,
        qrPng,
        certificateId: certificate.id
      }));
    }
  }
  private buildPdf(data: {
    studentName: string;
    courseTitle: string;
    issuedAt: string;
    verificationUrl: string;
    qrPng: Buffer;
    certificateId: string;
  }): Buffer {
    if (stryMutAct_9fa48("1605")) {
      {}
    } else {
      stryCov_9fa48("1605");
      const {
        studentName,
        courseTitle,
        issuedAt,
        verificationUrl,
        qrPng,
        certificateId
      } = data;
      const esc = stryMutAct_9fa48("1606") ? () => undefined : (stryCov_9fa48("1606"), (() => {
        const esc = (v: string) => v.replace(/\\/g, stryMutAct_9fa48("1607") ? "" : (stryCov_9fa48("1607"), '\\\\')).replace(/\(/g, stryMutAct_9fa48("1608") ? "" : (stryCov_9fa48("1608"), '\\(')).replace(/\)/g, stryMutAct_9fa48("1609") ? "" : (stryCov_9fa48("1609"), '\\)'));
        return esc;
      })());

      // Page: landscape letter 792 x 612
      const W = 792;
      const H = 612;

      // Parse PNG dimensions from IHDR chunk (bytes 16-23)
      const qrW = qrPng.readUInt32BE(16);
      const qrH = qrPng.readUInt32BE(20);
      const qrX = stryMutAct_9fa48("1610") ? W + 180 : (stryCov_9fa48("1610"), W - 180);
      const qrY = stryMutAct_9fa48("1611") ? H + 460 : (stryCov_9fa48("1611"), H - 460);
      const content = (stryMutAct_9fa48("1612") ? [] : (stryCov_9fa48("1612"), [// Background
      stryMutAct_9fa48("1613") ? `` : (stryCov_9fa48("1613"), `q 0.98 0.96 0.88 rg 0 0 ${W} ${H} re f Q`), // Top/bottom bars (teal)
      stryMutAct_9fa48("1614") ? `` : (stryCov_9fa48("1614"), `q 0.13 0.55 0.55 rg 0 ${stryMutAct_9fa48("1615") ? H + 18 : (stryCov_9fa48("1615"), H - 18)} ${W} 18 re f Q`), stryMutAct_9fa48("1616") ? `` : (stryCov_9fa48("1616"), `q 0.13 0.55 0.55 rg 0 0 ${W} 18 re f Q`), // Side bars
      stryMutAct_9fa48("1617") ? `` : (stryCov_9fa48("1617"), `q 0.13 0.55 0.55 rg 0 0 8 ${H} re f Q`), stryMutAct_9fa48("1618") ? `` : (stryCov_9fa48("1618"), `q 0.13 0.55 0.55 rg ${stryMutAct_9fa48("1619") ? W + 8 : (stryCov_9fa48("1619"), W - 8)} 0 8 ${H} re f Q`), // Title
      stryMutAct_9fa48("1620") ? `` : (stryCov_9fa48("1620"), `BT /F2 30 Tf 0.13 0.55 0.55 rg 60 ${stryMutAct_9fa48("1621") ? H + 85 : (stryCov_9fa48("1621"), H - 85)} Td (Certificate of Completion) Tj ET`), // Body text
      stryMutAct_9fa48("1622") ? `` : (stryCov_9fa48("1622"), `BT /F1 13 Tf 0.3 0.3 0.3 rg 60 ${stryMutAct_9fa48("1623") ? H + 130 : (stryCov_9fa48("1623"), H - 130)} Td (This certifies that) Tj ET`), stryMutAct_9fa48("1624") ? `` : (stryCov_9fa48("1624"), `BT /F2 24 Tf 0.1 0.1 0.1 rg 60 ${stryMutAct_9fa48("1625") ? H + 170 : (stryCov_9fa48("1625"), H - 170)} Td (${esc(studentName)}) Tj ET`), stryMutAct_9fa48("1626") ? `` : (stryCov_9fa48("1626"), `BT /F1 13 Tf 0.3 0.3 0.3 rg 60 ${stryMutAct_9fa48("1627") ? H + 210 : (stryCov_9fa48("1627"), H - 210)} Td (has successfully completed the course) Tj ET`), stryMutAct_9fa48("1628") ? `` : (stryCov_9fa48("1628"), `BT /F2 18 Tf 0.13 0.55 0.55 rg 60 ${stryMutAct_9fa48("1629") ? H + 250 : (stryCov_9fa48("1629"), H - 250)} Td (${esc(courseTitle)}) Tj ET`), // Divider
      stryMutAct_9fa48("1630") ? `` : (stryCov_9fa48("1630"), `q 0.7 0.7 0.7 RG 1 w 60 ${stryMutAct_9fa48("1631") ? H + 275 : (stryCov_9fa48("1631"), H - 275)} m ${stryMutAct_9fa48("1632") ? W + 60 : (stryCov_9fa48("1632"), W - 60)} ${stryMutAct_9fa48("1633") ? H + 275 : (stryCov_9fa48("1633"), H - 275)} l S Q`), // Meta
      stryMutAct_9fa48("1634") ? `` : (stryCov_9fa48("1634"), `BT /F1 11 Tf 0.3 0.3 0.3 rg 60 ${stryMutAct_9fa48("1635") ? H + 310 : (stryCov_9fa48("1635"), H - 310)} Td (Date Issued: ${esc(issuedAt)}) Tj ET`), stryMutAct_9fa48("1636") ? `` : (stryCov_9fa48("1636"), `BT /F1 9 Tf 0.5 0.5 0.5 rg 60 ${stryMutAct_9fa48("1637") ? H + 330 : (stryCov_9fa48("1637"), H - 330)} Td (Certificate ID: ${esc(certificateId)}) Tj ET`), stryMutAct_9fa48("1638") ? `` : (stryCov_9fa48("1638"), `BT /F1 9 Tf 0.5 0.5 0.5 rg 60 ${stryMutAct_9fa48("1639") ? H + 350 : (stryCov_9fa48("1639"), H - 350)} Td (Verify at: ${esc(verificationUrl)}) Tj ET`), // QR label
      stryMutAct_9fa48("1640") ? `` : (stryCov_9fa48("1640"), `BT /F1 9 Tf 0.3 0.3 0.3 rg ${qrX} ${stryMutAct_9fa48("1641") ? qrY + qrH - 8 : (stryCov_9fa48("1641"), (stryMutAct_9fa48("1642") ? qrY - qrH : (stryCov_9fa48("1642"), qrY + qrH)) + 8)} Td (Scan to verify on-chain) Tj ET`), // Draw QR image
      stryMutAct_9fa48("1643") ? `` : (stryCov_9fa48("1643"), `q ${qrW} 0 0 ${qrH} ${qrX} ${qrY} cm /QR Do Q`)])).join(stryMutAct_9fa48("1644") ? "" : (stryCov_9fa48("1644"), '\n'));
      const contentBuf = Buffer.from(content, stryMutAct_9fa48("1645") ? "" : (stryCov_9fa48("1645"), 'latin1'));

      // Build PDF objects as buffers
      const catalog = str(stryMutAct_9fa48("1646") ? `` : (stryCov_9fa48("1646"), `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj`));
      const pages = str(stryMutAct_9fa48("1647") ? `` : (stryCov_9fa48("1647"), `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj`));
      const page = str((stryMutAct_9fa48("1648") ? `` : (stryCov_9fa48("1648"), `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}]\n`)) + (stryMutAct_9fa48("1649") ? `` : (stryCov_9fa48("1649"), `/Resources << /Font << /F1 4 0 R /F2 5 0 R >> /XObject << /QR 6 0 R >> >>\n`)) + (stryMutAct_9fa48("1650") ? `` : (stryCov_9fa48("1650"), `/Contents 7 0 R >>\nendobj`)));
      const fontReg = str(stryMutAct_9fa48("1651") ? `` : (stryCov_9fa48("1651"), `4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj`));
      const fontBold = str(stryMutAct_9fa48("1652") ? `` : (stryCov_9fa48("1652"), `5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj`));

      // Object 6: PNG image XObject
      const qrHeader = str((stryMutAct_9fa48("1653") ? `` : (stryCov_9fa48("1653"), `6 0 obj\n<< /Type /XObject /Subtype /Image /Width ${qrW} /Height ${qrH}\n`)) + (stryMutAct_9fa48("1654") ? `` : (stryCov_9fa48("1654"), `/ColorSpace /DeviceGray /BitsPerComponent 8 /Filter /FlateDecode\n`)) + (stryMutAct_9fa48("1655") ? `` : (stryCov_9fa48("1655"), `/Length ${qrPng.length} >>\nstream\n`)));
      const qrFooter = str(stryMutAct_9fa48("1656") ? `` : (stryCov_9fa48("1656"), `\nendstream\nendobj`));

      // Object 7: content stream
      const contentObj = Buffer.concat(stryMutAct_9fa48("1657") ? [] : (stryCov_9fa48("1657"), [str(stryMutAct_9fa48("1658") ? `` : (stryCov_9fa48("1658"), `7 0 obj\n<< /Length ${contentBuf.length} >>\nstream\n`)), contentBuf, str(stryMutAct_9fa48("1659") ? `` : (stryCov_9fa48("1659"), `\nendstream\nendobj`))]));

      // Assemble with xref
      const header = str(stryMutAct_9fa48("1660") ? "" : (stryCov_9fa48("1660"), '%PDF-1.4\n'));
      const parts: Buffer[] = stryMutAct_9fa48("1661") ? [] : (stryCov_9fa48("1661"), [header]);
      const offsets: number[] = stryMutAct_9fa48("1662") ? ["Stryker was here"] : (stryCov_9fa48("1662"), []);
      let pos = header.length;
      const addObj = (buf: Buffer) => {
        if (stryMutAct_9fa48("1663")) {
          {}
        } else {
          stryCov_9fa48("1663");
          offsets.push(pos);
          parts.push(buf);
          stryMutAct_9fa48("1664") ? pos -= buf.length : (stryCov_9fa48("1664"), pos += buf.length);
        }
      };
      addObj(catalog);
      addObj(pages);
      addObj(page);
      addObj(fontReg);
      addObj(fontBold);

      // QR image object (binary stream)
      offsets.push(pos);
      const qrObjBuf = Buffer.concat(stryMutAct_9fa48("1665") ? [] : (stryCov_9fa48("1665"), [qrHeader, qrPng, qrFooter]));
      parts.push(qrObjBuf);
      stryMutAct_9fa48("1666") ? pos -= qrObjBuf.length : (stryCov_9fa48("1666"), pos += qrObjBuf.length);
      addObj(contentObj);
      const xrefOffset = pos;
      const xrefLines = stryMutAct_9fa48("1667") ? [] : (stryCov_9fa48("1667"), [stryMutAct_9fa48("1668") ? `` : (stryCov_9fa48("1668"), `xref\n0 ${stryMutAct_9fa48("1669") ? offsets.length - 1 : (stryCov_9fa48("1669"), offsets.length + 1)}\n`), stryMutAct_9fa48("1670") ? "" : (stryCov_9fa48("1670"), '0000000000 65535 f \n'), ...offsets.map(stryMutAct_9fa48("1671") ? () => undefined : (stryCov_9fa48("1671"), o => stryMutAct_9fa48("1672") ? `` : (stryCov_9fa48("1672"), `${o.toString().padStart(10, stryMutAct_9fa48("1673") ? "" : (stryCov_9fa48("1673"), '0'))} 00000 n \n`))), stryMutAct_9fa48("1674") ? `` : (stryCov_9fa48("1674"), `trailer\n<< /Size ${stryMutAct_9fa48("1675") ? offsets.length - 1 : (stryCov_9fa48("1675"), offsets.length + 1)} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`)]);
      parts.push(str(xrefLines.join(stryMutAct_9fa48("1676") ? "Stryker was here!" : (stryCov_9fa48("1676"), ''))));
      return Buffer.concat(parts);
    }
  }
}
function str(s: string): Buffer {
  if (stryMutAct_9fa48("1677")) {
    {}
  } else {
    stryCov_9fa48("1677");
    return Buffer.from(s + (stryMutAct_9fa48("1678") ? "" : (stryCov_9fa48("1678"), '\n')), stryMutAct_9fa48("1679") ? "" : (stryCov_9fa48("1679"), 'latin1'));
  }
}