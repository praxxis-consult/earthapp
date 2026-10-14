import type { ReactNode } from 'react'
import agricultureImg from '../../assets/images/deal-agriculture.jpg'
import energyImg from '../../assets/images/deal-energy.jpg'
import mineralsImg from '../../assets/images/deal-minerals.jpg'
import metalsImg from '../../assets/images/deal-metals.jpg'
import forestryImg from '../../assets/images/deal-forestry.jpg'
import rawMaterialsImg from '../../assets/images/deal-rawmaterials.jpg'

interface DealCategory {
  title: string
  description: string
  media: ReactNode
}

const categories: DealCategory[] = [
  {
    title: 'Agriculture',
    description: 'Cocoa, cashew, sesame, grains and food commodities.',
    media: (
      <img
        src={agricultureImg}
        alt="Agriculture"
        className="absolute bottom-[-0.39px] left-[calc(50%-55.76px)] h-[500.387px] w-[750.488px] max-w-none -translate-x-1/2 object-cover"
      />
    ),
  },
  {
    title: 'Energy',
    description: 'Crude oil, refined products and natural gas.',
    media: (
      <img
        src={energyImg}
        alt="Energy"
        className="absolute bottom-[-34px] left-1/2 h-[650px] w-130 max-w-none -translate-x-1/2 object-cover"
      />
    ),
  },
  {
    title: 'Minerals',
    description: 'Gold, lithium, iron ore and industrial minerals.',
    media: (
      <img
        src={mineralsImg}
        alt="Minerals"
        className="absolute right-0 bottom-[-20px] h-144 w-96 max-w-none object-cover"
      />
    ),
  },
  {
    title: 'Metals',
    description: 'Copper, aluminium and precious metals.',
    media: (
      <div className="pointer-events-none absolute bottom-0 left-[calc(50%+136px)] h-125 w-205 -translate-x-1/2 overflow-hidden">
        <img
          src={metalsImg}
          alt="Metals"
          className="absolute left-[0.06%] top-[-9.25%] h-[109.28%] w-[99.94%] max-w-none"
        />
      </div>
    ),
  },
  {
    title: 'Forestry',
    description: 'Timber, hardwood and processed wood products.',
    media: (
      <img
        src={forestryImg}
        alt="Forestry"
        className="absolute top-1/2 left-[calc(50%+82.95px)] h-125 w-[749.908px] max-w-none -translate-x-1/2 -translate-y-1/2 object-cover"
      />
    ),
  },
  {
    title: 'Raw Materials',
    description: 'Industrial inputs moving through ports worldwide.',
    media: (
      <img
        src={rawMaterialsImg}
        alt="Raw Materials"
        className="absolute top-1/2 left-[calc(50%+104.06px)] h-125 w-[752.112px] max-w-none -translate-x-1/2 -translate-y-1/2 object-cover"
      />
    ),
  },
]

export default function WhatWeDeal() {
  return (
    <section className="w-full bg-white py-16 font-jakarta">
      <div className="mx-auto w-full max-w-page px-30">
        <div className="mx-auto flex w-full max-w-content flex-col gap-10">
          <div className="flex items-center justify-between">
            <h2 className="text-[64px] font-semibold leading-18 tracking-[-3.2px] text-surface-dark">
              What we deal in
            </h2>
            <p className="w-110 text-[16px] leading-[29.25px] text-nav-text">
              Six categories, one operating discipline: verified supply, quality at origin, and
              clean documentation across borders.
            </p>
          </div>

          <div className="flex snap-x snap-mandatory gap-6 overflow-x-auto">
            {categories.map((category) => (
              <div
                key={category.title}
                className="relative h-125 w-96 shrink-0 snap-start overflow-hidden rounded-[20px] bg-card-placeholder"
              >
                {category.media}
                <div className="absolute inset-x-0 bottom-0 h-43.25 bg-linear-to-t from-overlay-dark from-1% to-overlay-dark/0" />
                <div className="absolute bottom-6 left-6 flex w-84 flex-col gap-2">
                  <h3 className="text-[24px] font-semibold leading-8 tracking-[-1px] text-white">
                    {category.title}
                  </h3>
                  <p className="text-[16px] leading-6 text-white/75">{category.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
