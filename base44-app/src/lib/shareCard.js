import html2canvas from 'html2canvas';

// The card is laid out at 300x375 and captured at 3.6x, so the downloaded file
// is a crisp 1080x1350 — the 4:5 shape that suits a feed post.
export const CARD_WIDTH = 300;
export const CARD_HEIGHT = 375;
export const CARD_SCALE = 3.6;

/**
 * Renders the on-screen card to a PNG and downloads it.
 *
 * The photo comes from the app's media host, so the browser has to be allowed
 * to read it back off the canvas. If that host refuses, the canvas is blocked
 * and this throws rather than handing over a blank image.
 */
export async function downloadCard(node, filename) {
  const canvas = await html2canvas(node, {
    scale: CARD_SCALE,
    useCORS: true,
    backgroundColor: null,
    logging: false,
  });

  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}