/* eslint-disable */
type PageConfig = {
    bvn?: boolean,
    nin?: boolean,
    dl?: boolean,
    mobile?: boolean,
    otp?: boolean,
    selfie?: boolean,
}

export type Page = {
    page: string;
    config?: PageConfig;
}