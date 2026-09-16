// Shared chrome for every calculator chart.
//
// These are the strings the chart FRAME needs — the disclosure that opens the
// data table, the heading over the assumptions, the legend label. The data
// itself, including every figure and every series name, arrives already
// labelled from the chart model, because the model is what the tests can see.
//
// The magnitude words are here because `lib/` holds no user-facing Vietnamese:
// `compactMoney` and `axisUnit` take them as arguments. One copy, shared by
// all five charts, so two charts on one page cannot disagree about what a
// billion is called.

export const CHART_UI = {
  /** Opens the accessible data table. A native <details>, so it works with no JS. */
  tableToggle: "Xem số liệu dạng bảng",
  assumptionsTitle: "Biểu đồ này giả định",
  legendTitle: "Ký hiệu",
  markersTitle: "Các mốc trên biểu đồ",
  /** Heading for the list of horizontal reference lines. */
  referencesTitle: "Đường tham chiếu",

  /** Read by assistive technology in place of the drawing itself. */
  figureRoleNote: "Biểu đồ minh họa. Số liệu đầy đủ ở bảng bên dưới.",

  money: {
    currency: "₫",
    million: "triệu",
    billion: "tỷ",
  },
} as const;
