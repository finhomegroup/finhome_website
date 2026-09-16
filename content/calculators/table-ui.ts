// Every visible string the readable result table needs.
//
// `components/calc/result-table.tsx` imports this directly, the same way
// `ChartFigure` imports `CHART_UI`: the table is a shared primitive, so its
// chrome cannot live in a per-calculator content file without 38 copies of it.
//
// The unit line says "Số tiền" rather than a bare "Đơn vị" on purpose. A table
// can mix amounts with rates and month counts, and only the amounts are scaled
// — a notice reading "Đơn vị: triệu đồng" over a column of percentages would
// be read as applying to them too.

export const TABLE_UI = {
  units: {
    dong: "Số tiền: đồng",
    trieu: "Số tiền: triệu đồng",
    ty: "Số tiền: tỷ đồng",
  },

  /** Label on the checkbox that switches the amounts to full đồng. */
  exactToggle: "Xem số đầy đủ (đồng)",

  /**
   * Shown only in full-đồng mode, where the table is wide enough to need it.
   * The scroll is inside the table's own frame, so nothing pushes the page
   * sideways.
   */
  scrollHint: "Bảng số đầy đủ cuộn ngang trong khung này.",

  /** Prefix for a real charge that rounds away at the table's precision. */
  lessThan: "<",
  /** Same, below zero: "> -0,1". */
  aboveNegative: ">",
} as const;
