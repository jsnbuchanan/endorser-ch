import * as express from 'express'

import ClaimService from '../services/claim.service'
import { hideDidsAndAddLinksToNetwork } from '../services/util-higher'

class Controller {

  importClaim(req, res) {
    if (!req.body.jwtEncoded) {
      res.status(400).json("Request body is missing a 'jwtEncoded' property.").end();
      return;
    }
    ClaimService
      .createWithClaimRecord(req.body.jwtEncoded, res.locals.tokenIssuer)
      .then(result => hideDidsAndAddLinksToNetwork(res.locals.tokenIssuer, result))
      .then(r => {
        const result = { success: r }
        return res
          .status(201)
          .location(`<%= apiRoot %>/api/claim/${r.claimId}`)
          .json(result)
      })
      .catch(err => {
        if (err.clientError) {
          res.status(400).json({ error: { message: err.clientError.message, code: err.clientError.code } })
        } else {
          console.log(err)
          res.status(500).json(""+err).end()
        }
      })
  }

}
let controller = new Controller();


export default express
  .Router()
  .all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    next();
  })

/**
 * See /server/common/server.js for other Swagger settings & pieces of generated docs.
 **/

/**
 * Add a Claim JWT (and insert claim data into their own tables for rapid searching)
 * @group claims - Claim Recording (with extended feedback)
 * @route POST /api/v2/claim
 * @param {EncodedJwt.model} jwtEncoded.body.required
 * @returns {object} 200 -
 * {
 * &nbsp; success:
 * &nbsp; {
 * &nbsp;&nbsp;&nbsp; claimId: string, // ID for this claim
 * &nbsp;&nbsp;&nbsp; clientMessage: string,
 * &nbsp;&nbsp;&nbsp; embeddedRecordError: object,
 * &nbsp;&nbsp;&nbsp; handleId: string, // ID for permanent reference, potentially based on input
 * &nbsp;&nbsp;&nbsp; recordsSavedForEdit: number,
 * &nbsp;&nbsp;&nbsp; actionId || orgRoleId || registrationId || tenureId || voteId: number,
 * &nbsp;&nbsp;&nbsp; confirmations: { confirmId: number }
 * &nbsp; },
 * &nbsp; error: { code: string, message: string }
 * }
 * @returns {Error} 400 - error
 */
// This comment makes doctrine-file work with babel. See API docs after: npm run compile; npm start
  .post('', controller.importClaim)
