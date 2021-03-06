import AbstractSyncer from './abstract-syncer';
import epkSyncHandler from './epk-syncer';

/**
 *
 */
class ArtistSyncer extends AbstractSyncer {
  // Remember to add any new fields that need syncing here.
  dateOfBirth = '';
  displayName = '';
  epkID = undefined;
  gender = '';
  isIndividual = true;
  signUpProg = 0;
  username = '';

  /**
   *
   * @param {String} firebaseAuthUid
   */
  constructor(firebaseAuthUid) {
    super(
        'artists',
        firebaseAuthUid,
        (snapshot, options) => {
          const data = snapshot.data(options);
          const instance = new ArtistSyncer(firebaseAuthUid);
          // Remember to add any new fields that need syncing here.
          instance.dateOfBirth = data.dateOfBirth;
          instance.displayName = data.displayName;
          instance.epkID = data.epkID;
          instance.gender = data.gender;
          instance.isIndividual = data.isIndividual;
          instance.signUpProg = data.signUpProg;
          instance.username = data.username;
          return instance;
        },
        (artistSyncer) => {
          return {
            // Remember to add any new fields that need syncing here.
            dateOfBirth: artistSyncer.dateOfBirth,
            displayName: artistSyncer.displayName,
            epkID: artistSyncer.epkID,
            gender: artistSyncer.gender,
            isIndividual: artistSyncer.isIndividual,
            signUpProg: artistSyncer.signUpProg,
            username: artistSyncer.username,
          };
        },
    );

    this.epkID = firebaseAuthUid;
  }

  /**
   *
   * @return {Promise<EpkSyncer>}
   */
  async getEpkSyncer() {
    return await epkSyncHandler.getSyncer(this.epkID);
  }
}

const syncers = new Map();

const artistSyncHandler = {
  /**
   *
   * @param {String} firebaseAuthUid
   * @return {Promise<ArtistSyncer>}
   */
  getSyncer: async (firebaseAuthUid) => {
    if (syncers.has(firebaseAuthUid)) {
      // We have a locally-saved copy of the ArtistSyncer.
      return syncers.get(firebaseAuthUid);
    }

    // We need to either create a new Syncer or pull from the cloud.
    const syncer = new ArtistSyncer(firebaseAuthUid);
    const remoteSyncer = await syncer.pullInstanceOfSelf();

    let latestSyncer;
    if (remoteSyncer === null) {
      // This is a newly-created Syncer.
      latestSyncer = syncer;
      await latestSyncer.push();
    } else {
      latestSyncer = remoteSyncer;
    }

    // Save this copy locally.
    syncers.set(firebaseAuthUid, latestSyncer);
    return latestSyncer;
  },
};

export default artistSyncHandler;
