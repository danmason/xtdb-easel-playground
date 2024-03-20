import type { APIRoute } from 'astro';
import Xtdb, { tx } from '@xtdb/xtdb'

const xtdb = new Xtdb('http://localhost:3000');

export const POST: APIRoute = async ({ params, request }) => {
    try {
      const { canvasId, canvasData } = await request.json();

      const txKey = await xtdb.submitTx(
        [tx.putDocs('drawings', { "xt/id": canvasId, "imageState": canvasData })]
      );

      const txTime = txKey["systemTime"]
      return new Response(JSON.stringify({ success: true, message: 'Data received', lastEdited: txTime }), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
        return new Response(JSON.stringify({ success: false, error: 'Failed to process request' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
};
