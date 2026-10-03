/**
 * Version string reported through `dSigXades*Js.getVersion()`.
 *
 * Compatibility gate, not decoration: schranka.slovensko.sk
 * (DSignerMulti.js `checkExistsAddXmlObject2`) parses this JSON and requires
 * plugin `sk.ditec.zep.dsigner.xades.bp.plugins.xmlplugin.XmlBpPlugin`
 * >= 2.0.0.13, otherwise it shows the "install a newer signer"
 * (OLD_DSIGNER) error and never calls `addXmlObject2`. Keep the plugin list
 * and versions parseable; the portal contract tests replay this gate.
 */
export const DSIGNER_VERSION_JSON =
  '{"name":"D.Signer/XAdES BP Java","version":"2.0.0.23","plugins":[{"name":"sk.ditec.zep.dsigner.xades.bp.plugins.xmlplugin.XmlBpPlugin","version":"2.0.0.23"},{"name":"sk.ditec.zep.dsigner.xades.bp.plugins.txtplugin.TxtBpPlugin","version":"2.0.0.23"},{"name":"sk.ditec.zep.dsigner.xades.bp.plugins.pngplugin.PngBpPlugin","version":"2.0.0.23"},{"name":"sk.ditec.zep.dsigner.xades.bp.plugins.pdfplugin.PdfBpPlugin","version":"2.0.0.23"}]}';
