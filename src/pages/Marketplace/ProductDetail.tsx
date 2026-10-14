import { useParams, useNavigate } from 'react-router-dom'
import { useGetListingQuery } from '../../feature/marketplace/catalogApiSlice'
import arrowDown from '../../assets/icons/mp-arrow-down.svg'
import arrowRight from '../../assets/icons/mp-arrow-right.svg'
import dollarCircle from '../../assets/icons/pd-dollar-circle.svg'
import starIcon from '../../assets/icons/pd-star.svg'
import plusIcon from '../../assets/icons/pd-plus.svg'

const jakarta = (weight: number, italic = false) => ({
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontWeight: weight,
  fontStyle: italic ? 'italic' : 'normal',
})

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  // undefined while loading, null when the API has no such public listing
  const product = useGetListingQuery(id ?? '', { skip: !id }).currentData

  if (!product) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <p className="text-[#807e7e] text-[16px]" style={jakarta(400)}>
          {product === undefined ? 'Loading…' : 'This listing is not available.'}
        </p>
      </div>
    )
  }

  const [para1, ...rest] = product.description.split(/\n\s*\n/)
  const para2 = rest.join('\n\n')
  const thumbnails = product.images.slice(1, 3)
  const extraPhotos = Math.max(0, product.images.length - 3)

  return (
    <div className="bg-white w-full pb-[120px]">
      <div className="max-w-[1200px] mx-auto">

        {/* ── Back + title + price ── */}
        <div className="relative pt-[64px]">

          {/* Back + title (left) */}
          <div className="flex flex-col gap-[16px] w-[301px]">
            <button
              onClick={() => navigate(-1)}
              className="flex gap-[8px] items-center"
            >
              {/* arrow-down rotated 90° = pointing left */}
              <div className="flex items-center justify-center size-[16px] rotate-90">
                <img src={arrowDown} alt="" className="size-[16px]" />
              </div>
              <span className="text-[#807e7e] text-[16px] leading-[24px]" style={jakarta(500)}>
                Back
              </span>
            </button>
            <h1
              className="text-[#0c2310] text-[24px] tracking-[-0.48px] leading-[32px]"
              style={jakarta(600)}
            >
              {product.title}
            </h1>
          </div>

          {/* Price (absolute right, vertically centred on the title row) */}
          <div className="absolute right-0 top-[96px] flex gap-[4px] items-center">
            <div className="p-[4px] flex items-center justify-center">
              <img src={dollarCircle} alt="" className="size-[24px]" />
            </div>
            <p
              className="text-[#007c53] text-[32px] tracking-[-0.64px] leading-[40px]"
              style={jakarta(700)}
            >
              {product.price}
            </p>
          </div>
        </div>

        {/* ── Image gallery ── */}
        <div className="relative w-full h-[500px] mt-[40px]">

          {/* Main image — left ~74.5% */}
          <div
            className="absolute top-0 left-0 bottom-0 bg-[#ededed] rounded-[20px] overflow-hidden"
            style={{ right: '25.5%' }}
          >
            {product.image && (
              <img
                src={product.image}
                alt={product.title}
                className="absolute bottom-0 left-0 w-full object-cover"
                style={{ height: '596px' }}
              />
            )}
          </div>

          {/* Top-right thumbnail */}
          <div
            className="absolute top-0 bottom-[52.4%] bg-[#ededed] rounded-[20px] overflow-hidden"
            style={{ left: '76.5%', right: 0 }}
          >
            {thumbnails[0] ? (
              <img
                src={thumbnails[0]}
                alt=""
                className="absolute top-0 left-1/2 -translate-x-1/2 w-full object-cover"
                style={{ height: '238px' }}
              />
            ) : product.image ? (
              <img
                src={product.image}
                alt=""
                className="absolute top-0 left-0 w-full h-full object-cover"
              />
            ) : null}
          </div>

          {/* Bottom-right thumbnail with "+N more" overlay */}
          <div
            className="absolute top-[52.4%] bottom-0 bg-[#ededed] rounded-[20px] overflow-hidden"
            style={{ left: '76.5%', right: 0 }}
          >
            {thumbnails[1] ? (
              <img
                src={thumbnails[1]}
                alt=""
                className="absolute top-0 left-1/2 -translate-x-1/2 w-full object-cover"
                style={{ height: '238px' }}
              />
            ) : product.image ? (
              <img
                src={product.image}
                alt=""
                className="absolute top-0 left-0 w-full h-full object-cover"
              />
            ) : null}

            {/* Gradient overlay with "+N" counter */}
            {extraPhotos > 0 && (
              <div
                className="absolute inset-0 flex items-center justify-center gap-[8px]"
                style={{ background: 'linear-gradient(to top, #141414 1%, rgba(20,20,20,0))' }}
              >
                <img src={plusIcon} alt="" className="size-[20px]" />
                <span
                  className="text-white text-[40px] leading-[48px]"
                  style={jakarta(700)}
                >
                  {extraPhotos}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Description + sidebar ── */}
        <div className="flex gap-[24px] items-start mt-[40px]">

          {/* Long description */}
          <div className="flex-1 flex flex-col gap-[16px]">
            {para1 && (
              <p className="text-[#101604] text-[16px] leading-[29.25px]" style={jakarta(400)}>
                {para1}
              </p>
            )}
            {para2 && (
              <p className="text-[#101604] text-[16px] leading-[29.25px]" style={jakarta(400)}>
                {para2}
              </p>
            )}
          </div>

          {/* Sidebar card */}
          <div
            className="flex flex-col gap-[24px] p-[24px] rounded-[20px] shrink-0 border border-[#e4dede]"
            style={{ width: '435px' }}
          >
            {/* Metadata */}
            <div className="flex flex-col gap-[16px]">
              {[
                { label: 'Sold by', value: product.store.storeName },
                { label: 'Location', value: product.location },
                { label: 'Quantity', value: product.quantity },
                { label: 'Listed', value: product.listed },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-[#101604] text-[16px] leading-[24px]" style={jakarta(600)}>
                    {label}
                  </span>
                  <span className="text-[#807e7e] text-[16px] leading-[24px] text-right" style={jakarta(400)}>
                    {value}
                  </span>
                </div>
              ))}

              {/* Rating row */}
              <div className="flex items-center justify-between">
                <span className="text-[#101604] text-[16px] leading-[24px]" style={jakarta(600)}>
                  Vendor's rating
                </span>
                {/* Reviews are not on the API yet; the row stays as designed until they are. */}
                <div className="flex gap-[4px] items-center">
                  <img src={starIcon} alt="" className="size-[16px]" />
                  <span className="text-[#807e7e] text-[16px] leading-[24px]" style={jakarta(500, true)}>
                    No reviews yet
                  </span>
                </div>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col gap-[16px]">
              {/* Place order */}
              <button
                onClick={() => navigate(`/marketplace/${product.id}/order`)}
                className="flex gap-[8px] h-[48px] items-center justify-center px-[24px] py-[16px] rounded-[30px] w-full"
                style={{ background: 'rgb(0, 124, 83)' }}
              >
                <span
                  className="text-[14px] tracking-[-0.14px]"
                  style={{
                    ...jakarta(500),
                    background: 'linear-gradient(178.5deg, #fff 4.99%, rgba(255,255,255,0.86) 85.73%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Place order
                </span>
                <img src={arrowRight} alt="" className="size-[16px]" />
              </button>

              {/* Send message */}
              <button
                type="button"
                title="Buyer messaging opens with the messaging API"
                className="bg-[#f7f7f7] h-[48px] flex items-center justify-center px-[28px] py-[16px] rounded-[30px] w-full"
              >
                <span className="text-[#101604] text-[14px] tracking-[-0.14px]" style={jakarta(500)}>
                  Send message
                </span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
