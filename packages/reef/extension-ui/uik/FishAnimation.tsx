import React from 'react';

export interface Props {
  className?: string
}

export const FishAnimation = ({ className }: Props): JSX.Element => (
  <div className='fish-animation'>
    <svg
      className={`fish-animation__fish ${className || ''}`}
      viewBox='0 0 66 29'
      xmlns='http://www.w3.org/2000/svg'
    >

      <g
        fill='none'
        fillRule='evenodd'
        transform='translate(0 -1)'
      >
        <g transform='translate(15 .1864)'>
          <path
            d='M5.9856 12.9696l9.514-5.259c.607-.335.829-1.106.493-1.713l-1.25-2.26c-1.508-2.73-4.976-3.729-7.706-2.22l-5.654 3.125c-.606.335-.828 1.105-.493 1.713l3.384 6.121c.335.606 1.106.828 1.712.493'
            fill='#1E0135'
          ></path>
        </g>
        <g transform='translate(15 16.1864)'>
          <path
            d='M5.9856.8436l9.514 5.259c.607.336.829 1.106.493 1.713l-1.25 2.261c-1.508 2.73-4.976 3.729-7.706 2.22l-5.654-3.126c-.606-.335-.828-1.105-.493-1.712l3.384-6.121c.335-.607 1.106-.829 1.712-.494'
            fill='#1E0135'
          ></path>
        </g>
        <path
          className='body'
          d='M13.2576 15.0935s8.722-13.183 26.167-13.183c17.444 0 26.166 13.183 26.166 13.183s-8.722 13.183-26.166 13.183c-17.445 0-26.167-13.183-26.167-13.183'
          fill='#A0F'
        ></path>
        <path
          d='M53.5388 10.4021c0 .854.693 1.548 1.547 1.548.855 0 1.548-.694 1.548-1.548 0-.854-.693-1.547-1.548-1.547-.854 0-1.547.693-1.547 1.547'
          fill='#1E0135'
        ></path>
        <path
          d='M46.4583 14.991c1.396 0 2.528-1.132 2.528-2.528 0-1.397-1.132-2.528-2.528-2.528M46.4583 20.9304c1.396-.001 2.528-1.133 2.528-2.528 0-1.397-1.132-2.529-2.528-2.529'
          fill='#FFFF8D'
        ></path>
        <path
          d='M29.8621 14.991c1.396 0 2.528-1.132 2.528-2.528 0-1.397-1.132-2.528-2.528-2.528M29.8621 20.9304c1.396-.001 2.528-1.133 2.528-2.528 0-1.397-1.132-2.529-2.528-2.529'
          fill='#EA80FC'
        ></path>
        <path
          d='M24.3303 17.6208c1.396 0 2.528-1.132 2.528-2.528 0-1.396-1.132-2.528-2.528-2.528'
          fill='#FFFF8D'
        ></path>
        <path
          d='M40.926 17.7351c1.396 0 2.528-1.132 2.528-2.527 0-1.397-1.132-2.529-2.528-2.529M40.926 11.5681c1.396-.001 2.528-1.133 2.528-2.528 0-1.397-1.132-2.529-2.528-2.529M40.926 23.6746c1.396 0 2.528-1.132 2.528-2.528 0-1.396-1.132-2.528-2.528-2.528'
          fill='#EA80FC'
        ></path>
        <path
          d='M35.3943 17.7351c1.396 0 2.528-1.132 2.528-2.527 0-1.397-1.132-2.529-2.528-2.529M35.3943 11.5681c1.396-.001 2.528-1.133 2.528-2.528 0-1.397-1.132-2.529-2.528-2.529M35.3943 23.6746c1.396 0 2.528-1.132 2.528-2.528 0-1.396-1.132-2.528-2.528-2.528'
          fill='#FFFF8D'
        ></path>
        <path
          className='fish-animation__fin'
          d='M2.0715 24.2458l19.154-9.152-19.154-9.154c-2.762 6.103-2.762 12.204 0 18.306'
          fill='#A0F'
        ></path>
      </g>
    </svg>
  </div>
);
