// Illustrations — No Favorites
import noFavoritesBg from '../../assets/images/empty-states/no-favorites-bg.svg'
import noFavoritesTag2Card from '../../assets/images/empty-states/no-favorites-tag2-card.svg'
import noFavoritesTag2Icon from '../../assets/images/empty-states/no-favorites-tag2-icon.svg'
import noFavoritesTag2Ellipse from '../../assets/images/empty-states/no-favorites-tag2-ellipse.svg'
import noFavoritesTag1Card from '../../assets/images/empty-states/no-favorites-tag1-card.svg'
import noFavoritesTag1Icon from '../../assets/images/empty-states/no-favorites-tag1-icon.svg'
import noFavoritesTag1Ellipse from '../../assets/images/empty-states/no-favorites-tag1-ellipse.svg'
// Cart Empty
import cartEmptyBg from '../../assets/images/empty-states/cart-empty-bg.svg'
import cartEmptyIllustration from '../../assets/images/empty-states/cart-empty-illustration.svg'
// No Results Found
import noResultsBg from '../../assets/images/empty-states/no-results-bg.svg'
import noResultsIllustration from '../../assets/images/empty-states/no-results-illustration.svg'
// Inbox Empty
import inboxEmptyBg from '../../assets/images/empty-states/inbox-empty-bg.svg'
import inboxEmptyIllustration from '../../assets/images/empty-states/inbox-empty-illustration.svg'
// No Notifications
import noNotificationsBg from '../../assets/images/empty-states/no-notifications-bg.svg'
import noNotificationsIllustration from '../../assets/images/empty-states/no-notifications-illustration.svg'
// Enable Location
import enableLocationBg from '../../assets/images/empty-states/enable-location-bg.svg'
import enableLocationIllustration from '../../assets/images/empty-states/enable-location-illustration.svg'
// No Pictures
import noPicturesBg from '../../assets/images/empty-states/no-pictures-bg.svg'
import noPicturesFrontPhoto from '../../assets/images/empty-states/no-pictures-front-photo.svg'
// 404
import notFoundBg from '../../assets/images/empty-states/not-found-bg.svg'
import notFoundIllustration from '../../assets/images/empty-states/not-found-illustration.svg'
// No Connection
import noConnectionBg from '../../assets/images/empty-states/no-connection-bg.svg'
import noConnectionPlug2 from '../../assets/images/empty-states/no-connection-plug2.svg'
import noConnectionPlug1 from '../../assets/images/empty-states/no-connection-plug1.svg'

export type EmptyStateVariant =
  | 'no-favorites'
  | 'cart-empty'
  | 'no-results'
  | 'inbox-empty'
  | 'no-notifications'
  | 'enable-location'
  | 'no-pictures'
  | 'not-found'
  | 'no-connection'

interface EmptyStateProps {
  variant: EmptyStateVariant
  className?: string
}

/* ── Per-variant content config ── */
interface StateConfig {
  title: string
  subtitle: string[]
  borderRadius: string
  illustration: React.ReactNode
}

function NoFavoritesIllustration() {
  return (
    <div className="absolute left-[120px] top-[16px] size-[560px]">
      {/* Background */}
      <img
        alt=""
        src={noFavoritesBg}
        className="absolute"
        style={{ left: '63px', top: '67px', width: '412px', height: '425.479px' }}
      />
      {/* Tag 2 (right — playing cards, rotated +10.85°) */}
      <div
        className="absolute flex items-center justify-center"
        style={{ left: '310px', top: '169px', width: '187.32px', height: '263.566px' }}
      >
        <div style={{ transform: 'rotate(10.85deg)', width: '144.614px', height: '240.65px', position: 'relative', flexShrink: 0 }}>
          <img
            alt=""
            src={noFavoritesTag2Card}
            className="absolute block max-w-none"
            style={{ inset: '0 0 1.3% 0', width: '100%', height: '100%' }}
          />
        </div>
      </div>
      <div
        className="absolute flex items-center justify-center"
        style={{ left: '372px', top: '225px', width: '78.085px', height: '72.498px' }}
      >
        <div style={{ transform: 'rotate(12.06deg)', width: '67.071px', height: '59.805px', position: 'relative', flexShrink: 0 }}>
          <img
            alt=""
            src={noFavoritesTag2Icon}
            className="absolute block inset-0 max-w-none size-full"
          />
        </div>
      </div>
      <img
        alt=""
        src={noFavoritesTag2Ellipse}
        className="absolute block"
        style={{ left: '378px', top: '360px', width: '26px', height: '26px' }}
      />

      {/* Tag 1 (left — playing cards, rotated −19.91°) */}
      <div
        className="absolute flex items-center justify-center"
        style={{ left: '85.95px', top: '116.68px', width: '291.592px', height: '368.65px' }}
      >
        <div style={{ transform: 'rotate(-19.91deg)', width: '193.5px', height: '322px', position: 'relative', flexShrink: 0 }}>
          <img
            alt=""
            src={noFavoritesTag1Card}
            className="absolute block max-w-none"
            style={{ inset: '-1.24% -2.07% -0.27% -2.07%', width: '104.14%', height: '101.51%' }}
          />
        </div>
      </div>
      <div
        className="absolute flex items-center justify-center"
        style={{ left: '150px', top: '188px', width: '128.432px', height: '122.17px' }}
      >
        <div style={{ transform: 'rotate(-21.43deg)', width: '102.205px', height: '91.133px', position: 'relative', flexShrink: 0 }}>
          <img
            alt=""
            src={noFavoritesTag1Icon}
            className="absolute block inset-0 max-w-none size-full"
          />
        </div>
      </div>
      <img
        alt=""
        src={noFavoritesTag1Ellipse}
        className="absolute block"
        style={{ left: '253px', top: '376px', width: '33px', height: '33px' }}
      />
    </div>
  )
}

function CartEmptyIllustration() {
  return (
    <div className="absolute left-[120px] top-[16px] size-[560px]">
      <img
        alt=""
        src={cartEmptyBg}
        className="absolute block"
        style={{ left: '66px', top: '45px', width: '428.982px', height: '392px' }}
      />
      {/* Illustration rotated −20.53° */}
      <div
        className="absolute flex items-center justify-center"
        style={{ left: '88.37px', top: '60.68px', width: '385.597px', height: '454.357px' }}
      >
        <div style={{ transform: 'rotate(-20.53deg)', width: '267.58px', height: '384.965px', position: 'relative', flexShrink: 0 }}>
          <img
            alt=""
            src={cartEmptyIllustration}
            className="absolute block max-w-none"
            style={{ inset: '0 -0.51% 0 0', width: '100.51%', height: '100%' }}
          />
        </div>
      </div>
    </div>
  )
}

function NoResultsIllustration() {
  return (
    <div className="absolute left-[120px] top-[16px] size-[560px]">
      <img
        alt=""
        src={noResultsBg}
        className="absolute block"
        style={{ left: '69px', top: '87px', width: '422.982px', height: '386px' }}
      />
      <img
        alt=""
        src={noResultsIllustration}
        className="absolute block"
        style={{ left: '167px', top: '120px', width: '260px', height: '353.069px' }}
      />
    </div>
  )
}

function InboxEmptyIllustration() {
  return (
    <div className="absolute left-[120px] top-[16px] size-[560px]">
      <img
        alt=""
        src={inboxEmptyBg}
        className="absolute block"
        style={{ left: '58px', top: '88px', width: '444.982px', height: '385px' }}
      />
      <img
        alt=""
        src={inboxEmptyIllustration}
        className="absolute block max-w-none"
        style={{ left: '108px', top: '153px', width: '313.5px', height: '320px' }}
      />
    </div>
  )
}

function NoNotificationsIllustration() {
  return (
    <div className="absolute left-[120px] top-[16px] size-[560px]">
      <img
        alt=""
        src={noNotificationsBg}
        className="absolute block"
        style={{ left: '69px', top: '104.99px', width: '422.982px', height: '379px' }}
      />
      {/* Illustration rotated −15.17° */}
      <div
        className="absolute flex items-center justify-center"
        style={{ left: '77.75px', top: '76.5px', width: '392.521px', height: '384.485px' }}
      >
        <div style={{ transform: 'rotate(-15.17deg)', width: '322.396px', height: '310.975px', position: 'relative', flexShrink: 0 }}>
          <img
            alt=""
            src={noNotificationsIllustration}
            className="absolute block max-w-none"
            style={{ inset: '0 -0.59% -0.64% -0.24%', width: '100.83%', height: '101.14%' }}
          />
        </div>
      </div>
    </div>
  )
}

function EnableLocationIllustration() {
  return (
    <div className="absolute left-[119px] top-[16px] size-[560px]">
      <img
        alt=""
        src={enableLocationBg}
        className="absolute block"
        style={{ left: '96.98px', top: '85px', width: '365.023px', height: '390.906px' }}
      />
      <img
        alt=""
        src={enableLocationIllustration}
        className="absolute block"
        style={{ left: '92px', top: '119px', width: '375.797px', height: '327.5px' }}
      />
    </div>
  )
}

function NoPicturesIllustration() {
  return (
    <div className="absolute left-[120px] top-[16px] size-[560px]">
      <img
        alt=""
        src={noPicturesBg}
        className="absolute block"
        style={{ left: '56px', top: '101px', width: '448.982px', height: '358px' }}
      />
      {/* Back photos — CSS-drawn rotated frames */}
      {/* Photo 2 (right, rotated +10°) */}
      <div
        className="absolute flex items-center justify-center"
        style={{ left: '255.47px', top: '185.21px', width: '206.526px', height: '217.719px' }}
      >
        <div style={{ transform: 'rotate(10deg)', flexShrink: 0 }}>
          <div
            className="bg-white border-4 border-[#8ecea3] border-solid rounded-[8.492px] relative"
            style={{ width: '176.208px', height: '190.008px' }}
          />
        </div>
      </div>
      <div
        className="absolute flex items-center justify-center"
        style={{ left: '273.85px', top: '197.51px', width: '174.804px', height: '158.444px' }}
      >
        <div style={{ transform: 'rotate(10deg)', flexShrink: 0 }}>
          <div
            className="bg-[#ecf6ef] border-4 border-[#ecf6ef] border-solid rounded-[8.492px] relative"
            style={{ width: '153.917px', height: '133.749px' }}
          />
        </div>
      </div>
      {/* Photo 1 (left, rotated −10°) */}
      <div
        className="absolute flex items-center justify-center"
        style={{ left: '115px', top: '185.21px', width: '206.526px', height: '217.719px' }}
      >
        <div style={{ transform: 'rotate(-10deg)', flexShrink: 0 }}>
          <div
            className="bg-white border-4 border-[#8ecea3] border-solid rounded-[8.492px] relative"
            style={{ width: '176.208px', height: '190.008px' }}
          />
        </div>
      </div>
      <div
        className="absolute flex items-center justify-center"
        style={{ left: '127.3px', top: '197.69px', width: '174.804px', height: '158.444px' }}
      >
        <div style={{ transform: 'rotate(-10deg)', flexShrink: 0 }}>
          <div
            className="bg-[#ecf6ef] border-4 border-[#ecf6ef] border-solid rounded-[8.492px] relative"
            style={{ width: '153.917px', height: '133.749px' }}
          />
        </div>
      </div>
      {/* Front photo SVG */}
      <div
        className="absolute"
        style={{ left: '188.61px', top: '169px', width: '210.934px', height: '227.453px' }}
      >
        <img
          alt=""
          src={noPicturesFrontPhoto}
          className="absolute block max-w-none"
          style={{ inset: '-1.76% -1.9%', width: '103.8%', height: '103.52%' }}
        />
      </div>
    </div>
  )
}

function NotFoundIllustration() {
  return (
    <div className="absolute left-[104px] top-[16px] size-[560px]">
      <img
        alt=""
        src={notFoundBg}
        className="absolute block"
        style={{ left: '98px', top: '45px', width: '394.982px', height: '407.133px' }}
      />
      <img
        alt=""
        src={notFoundIllustration}
        className="absolute block"
        style={{ left: '24px', top: '167.33px', width: '469.427px', height: '195.673px' }}
      />
    </div>
  )
}

function NoConnectionIllustration() {
  return (
    <div className="absolute left-[120px] top-[16px] size-[560px] overflow-hidden">
      <img
        alt=""
        src={noConnectionBg}
        className="absolute block"
        style={{ left: '68px', top: '91px', width: '422.982px', height: '358px' }}
      />
      {/* Plug 2 (left plug, rotated +26.79°) */}
      <div
        className="absolute flex items-center justify-center"
        style={{ left: '37.02px', top: '136.98px', width: '268.36px', height: '229.58px' }}
      >
        <div style={{ transform: 'rotate(26.79deg)', flexShrink: 0, width: '220px', height: '200px', position: 'relative' }}>
          <img
            alt=""
            src={noConnectionPlug2}
            className="absolute block max-w-none"
            style={{ inset: '0 0 0 -0.41%', width: '100.41%', height: '100%' }}
          />
        </div>
      </div>
      {/* Plug 1 (right plug, rotated +149.22°) */}
      <div
        className="absolute flex items-center justify-center"
        style={{ left: '184.02px', top: '169.63px', width: '338.95px', height: '228.19px' }}
      >
        <div style={{ transform: 'rotate(149.22deg)', flexShrink: 0, width: '220px', height: '200px', position: 'relative' }}>
          <img
            alt=""
            src={noConnectionPlug1}
            className="absolute block max-w-none"
            style={{ inset: '0 0 0 -0.26%', width: '100.26%', height: '100%' }}
          />
        </div>
      </div>
    </div>
  )
}

/* ── Variant config map ── */
const stateConfigs: Record<EmptyStateVariant, StateConfig> = {
  'no-favorites': {
    title: 'No favorites',
    subtitle: ["You have nothing on your list yet.", "It's never too late to change it :)"],
    borderRadius: '56px',
    illustration: <NoFavoritesIllustration />,
  },
  'cart-empty': {
    title: 'Cart empty',
    subtitle: ['Your cart is empty.', 'Start adding items to enjoy shopping!'],
    borderRadius: '56px',
    illustration: <CartEmptyIllustration />,
  },
  'no-results': {
    title: 'No results found',
    subtitle: ['No results found. Please try again.'],
    borderRadius: '64px',
    illustration: <NoResultsIllustration />,
  },
  'inbox-empty': {
    title: 'Inbox empty',
    subtitle: ['You have no messages yet.', 'Be the first to start a conversation'],
    borderRadius: '56px',
    illustration: <InboxEmptyIllustration />,
  },
  'no-notifications': {
    title: 'No notifications',
    subtitle: ['You have no notifications yet.', 'Please come back later.'],
    borderRadius: '56px',
    illustration: <NoNotificationsIllustration />,
  },
  'enable-location': {
    title: 'Enable location',
    subtitle: [
      'To provide you with personalized recommendations,',
      'please enable location services on your device.',
    ],
    borderRadius: '56px',
    illustration: <EnableLocationIllustration />,
  },
  'no-pictures': {
    title: 'No pictures',
    subtitle: ['Capture new moments or upload', 'your favorite images.'],
    borderRadius: '56px',
    illustration: <NoPicturesIllustration />,
  },
  'not-found': {
    title: '404',
    subtitle: ["Oops! The page you're looking for can't be found."],
    borderRadius: '56px',
    illustration: <NotFoundIllustration />,
  },
  'no-connection': {
    title: 'No connection',
    subtitle: ["Oops! It seems you're currently offline."],
    borderRadius: '56px',
    illustration: <NoConnectionIllustration />,
  },
}

export default function EmptyState({ variant, className = '' }: EmptyStateProps) {
  const config = stateConfigs[variant]

  return (
    <div
      className={`relative bg-white overflow-hidden ${className}`}
      style={{
        width: '800px',
        height: '800px',
        borderRadius: config.borderRadius,
        boxShadow: '0px 18px 110px 0px rgba(208, 208, 208, 0.47)',
      }}
    >
      {/* Illustration */}
      {config.illustration}

      {/* Title */}
      <p
        className="absolute left-1/2 -translate-x-1/2 text-center text-[#111] text-[40px] whitespace-nowrap"
        style={{
          top: '592px',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          lineHeight: 'normal',
        }}
      >
        {config.title}
      </p>

      {/* Subtitle */}
      <div
        className="absolute left-1/2 -translate-x-1/2 text-center text-[#838282] text-[24px]"
        style={{
          top: '656px',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 400,
          lineHeight: 'normal',
          whiteSpace: 'nowrap',
        }}
      >
        {config.subtitle.map((line, i) => (
          <p key={i} style={{ margin: i < config.subtitle.length - 1 ? '0 0 4px' : 0 }}>
            {line}
          </p>
        ))}
      </div>
    </div>
  )
}
