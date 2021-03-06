import React from 'react';
import {Navigate} from 'react-router-dom';
import PropTypes from 'prop-types';
import {ref, getDownloadURL} from 'firebase/storage';
import service from '../../../models/firebase/service';
import artistSyncHandler from '../../../models/firebase/syncers/artist-syncer';
import './review.css';

/**
 *
 */
class Review extends React.Component {
  /**
   *
   * @param {Review.propTypes} props
   */
  constructor(props) {
    super(props);

    this.state = {
      unauthorised: false,
      shouldRedirect: false,
      shouldGoBackTo: 0,
      displayName: '',
      genres: [],
      biography: '',
      linkToInstagram: '',
      linkToSpotify: '',
      linkToAppleMusic: '',
      linkToSoundCloud: '',
      linkToFacebook: '',
      contactPhone: '',
      contactEmail: '',
      proPicUrls: [],
    };

    this.handleFormSubmit = this.handleFormSubmit.bind(this);
  }

  /**
   *
   */
  async componentDidMount() {
    if (this.props.currUser) {
      const artistSyncer =
        await artistSyncHandler.getSyncer(this.props.currUser.uid);

      if (artistSyncer.signUpProg !== 4) {
        this.setState((prevState) => {
          return {...prevState, unauthorised: true};
        });
        return;
      }

      const epkSyncer = await artistSyncer.getEpkSyncer();
      const proPicUrls = await this.getProPicUrls();

      this.setState((prevState) => {
        return {
          ...prevState,
          displayName: epkSyncer.displayName,
          genres: epkSyncer.genres,
          biography: epkSyncer.biography,
          linkToInstagram: epkSyncer.linkToInstagram,
          linkToSpotify: epkSyncer.linkToSpotify,
          linkToAppleMusic: epkSyncer.linkToAppleMusic,
          linkToSoundCloud: epkSyncer.linkToSoundCloud,
          linkToFacebook: epkSyncer.linkToFacebook,
          contactPhone: epkSyncer.contactPhone,
          contactEmail: epkSyncer.contactEmail,
          proPicUrls: proPicUrls,
        };
      });
    } else {
      this.setState((prevState) => {
        return {...prevState, unauthorised: true};
      });
    }
  }

  /**
   *
   * @param {Object} prevProps
   * @param {Object} prevState
   * @param {Object} snapshot
   */
  async componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.currUser === prevProps.currUser) return;
    if (this.props.currUser) {
      const artistSyncer =
        await artistSyncHandler.getSyncer(this.props.currUser.uid);

      if (artistSyncer.signUpProg !== 4) {
        this.setState((prevState) => {
          return {...prevState, unauthorised: true};
        });
        return;
      }

      const epkSyncer = await artistSyncer.getEpkSyncer();
      const proPicUrls = await this.getProPicUrls();

      this.setState((prevState) => {
        return {
          ...prevState,
          displayName: epkSyncer.displayName,
          genres: epkSyncer.genres,
          biography: epkSyncer.biography,
          linkToInstagram: epkSyncer.linkToInstagram,
          linkToSpotify: epkSyncer.linkToSpotify,
          linkToAppleMusic: epkSyncer.linkToAppleMusic,
          linkToSoundCloud: epkSyncer.linkToSoundCloud,
          linkToFacebook: epkSyncer.linkToFacebook,
          contactPhone: epkSyncer.contactPhone,
          contactEmail: epkSyncer.contactEmail,
          proPicUrls: proPicUrls,
        };
      });
    } else {
      this.setState((prevState) => {
        return {...prevState, unauthorised: true};
      });
    }
  }

  /**
   *
   * @return {Promise<String[]>}
   */
  async getProPicUrls() {
    const urls = [];
    if (this.props.currUser) {
      const artistSyncer =
        await artistSyncHandler.getSyncer(this.props.currUser.uid);
      const epkSyncer = await artistSyncer.getEpkSyncer();

      for (const fileName of epkSyncer.proPicFilenames) {
        const uploadPath = `epkMedia/${this.props.currUser.uid}/${fileName}`;
        const storageRef = ref(service.storage, uploadPath);
        const storageUrl = await getDownloadURL(storageRef);
        urls.push(storageUrl);
      }
    }
    return urls;
  }

  /**
   *
   * @param {Event} event
   */
  async handleFormSubmit(event) {
    event.preventDefault();

    const artistSyncer =
      await artistSyncHandler.getSyncer(this.props.currUser.uid);
    artistSyncer.signUpProg = 5;
    await artistSyncer.push();
    this.setState((prevState) => {
      return {...prevState, shouldRedirect: true};
    });
  }

  /**
   *
   * @return {JSX.Element}
   */
  render() {
    if (this.state.unauthorised) {
      return <Navigate replace to={'/sign-up/artists'}/>;
    }

    if (this.state.shouldRedirect) {
      return <Navigate replace to={'/sign-up/artists/thank-you'}/>;
    }

    if (this.state.shouldGoBackTo > 0) {
      switch (this.state.shouldGoBackTo) {
        case 1:
          return <Navigate replace to={'/sign-up/artists/profile-picture'}/>;
        case 2:
          return <Navigate replace to={'/sign-up/artists/set-up-epk'}/>;
        case 3:
          return <Navigate replace to={'/sign-up/artists/connect-socials'}/>;
        default:
          return null;
      }
    }

    const socialLinksToIcons = {
      linkToInstagram: 'icon-instagram-dark.png',
      linkToSpotify: 'icon-spotify-dark.png',
      linkToAppleMusic: 'icon-apple-music-dark.png',
      linkToSoundCloud: 'icon-soundcloud-dark.png',
      linkToFacebook: 'icon-facebook-dark',
    };
    const socialsConnectedIcons = Object.keys(socialLinksToIcons)
        .filter((key) => {
          return this.state[key] !== '' && this.state[key] !== '\\null';
        })
        .map((key) => {
          const val = socialLinksToIcons[key];
          return <img key={key} src={require(`../../../assets/${val}`)}
            alt="Error" className="m-1" width="64" height="64"/>;
        });

    const proPicImages = this.state.proPicUrls.map((url) => {
      return <img key={url} src={url} alt="Unknown Item"
        className="m-1 rounded" height="180"/>;
    });

    return (
      <div className={'container'}>
        <div className="my-4 text-center">
          <h1>{this.state.displayName}</h1>
        </div>
        <div className="container text-left text-dark">
          <div className="row g-3">
            <div className="col-xl-6 col-md-12">
              <div className="h-65 p-3 bg-light rounded zoomable">
                <h2 onClick={() => {
                  this.setState({shouldGoBackTo: 2});
                }}>Details</h2>
                <form>
                  <div className="form-group my-1">
                    <label htmlFor="genres">Genres:</label>
                    <input type="text" readOnly
                      className="form-control-plaintext" id="genres"
                      name="genres" value={this.state.genres.join(', ')}/>
                  </div>
                  <div className="form-group my-1">
                    <label htmlFor="biography">Description:</label>
                    <textarea className="form-control-plaintext
                    amphere-input-textarea" id="biography" name="biography"
                    rows="6" wrap="soft" maxLength="300"
                    value={this.state.biography} readOnly/>
                  </div>
                </form>
              </div>
              <div className="h-35 mt-3 p-3 bg-light rounded zoomable">
                <h2 onClick={() => {
                  this.setState({shouldGoBackTo: 3});
                }}>Socials Connected</h2>
                <div className="d-flex justify-content-start overflow-auto">
                  {socialsConnectedIcons}
                </div>
              </div>
            </div>
            <div className="col-xl-6 col-md-12">
              <div className="h-45 p-3 bg-light rounded zoomable">
                <h2 onClick={() => {
                  this.setState({shouldGoBackTo: 2});
                }}>Contact Details</h2>
                <form>
                  <div className="form-group row">
                    <label htmlFor="contactPhone"
                      className="col-sm-3 col-form-label">
                      Phone:
                    </label>
                    <div className="col-sm-9">
                      <input type="text" readOnly
                        className="form-control-plaintext" id="contactPhone"
                        name="contactPhone" value={this.state.contactPhone}/>
                    </div>
                    <label htmlFor="contactEmail"
                      className="col-sm-3 col-form-label">
                      Mgt. Email:
                    </label>
                    <div className="col-sm-9">
                      <input type="text" readOnly
                        className="form-control-plaintext" id="contactEmail"
                        name="contactEmail" value={this.state.contactEmail}/>
                    </div>
                  </div>
                </form>
              </div>
              <div className="h-55 mt-3 p-3 bg-light rounded zoomable">
                <h2 onClick={() => {
                  this.setState({shouldGoBackTo: 1});
                }}>Photos</h2>
                <div className="d-flex justify-content-start overflow-auto">
                  {proPicImages}
                </div>
              </div>
            </div>
          </div>
        </div>
        <form className="my-5" onSubmit={this.handleFormSubmit}>
          <input type="submit" name="action" value="S U B M I T"/>
        </form>
      </div>
    );
  }
}

Review.propTypes = {
  currUser: PropTypes.object,
  onError: PropTypes.func,
};

export default Review;
