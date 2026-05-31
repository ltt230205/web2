export const createEmptyAddress = () => ({
  receiver_name: '',
  receiver_phone: '',
  province_name: '',
  district_name: '',
  ward_name: '',
  address_line: '',
  is_default: false,
})

export const addressFields = [
  ['receiver_name', 'Tên người nhận'],
  ['receiver_phone', 'Số điện thoại'],
  ['province_name', 'Tỉnh/Thành phố'],
  ['district_name', 'Quận/Huyện'],
  ['ward_name', 'Phường/Xã'],
  ['address_line', 'Địa chỉ cụ thể'],
]
