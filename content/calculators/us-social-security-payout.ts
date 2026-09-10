// Copy for /cong-cu/chi-tra-an-sinh-xa-hoi/.
//
// Original FinHome copy. Models UNITED STATES law — registry sets
// usRules: true and CalculatorPage renders the us-rules notice.
//
// Takes the PIA as an input rather than computing it, so this page needs
// NONE of the annually indexed bend points — see lib/calc/us-social-security.ts.
// The one indexed figure it does use is the earnings-test exempt amount,
// which is an input with the year stated in the copy and bound to
// EARNINGS_TEST by this page's test, per docs §8 defect 8.
//
// Figures quoted are householdBenefit's and earningsTestWithholding's
// output, verified by running them on this page's own defaults (PIA
// 2.800 USD; sinh 1963, nhận ở tuổi 67; vợ/chồng PIA 900 USD, sinh 1965,
// nhận ở tuổi 67; không còn thu nhập từ việc làm):
//   Bạn nhận 2.800; vợ/chồng theo hồ sơ riêng 900 nhưng trợ cấp theo
//     vợ/chồng là 1.400, nên họ nhận 1.400
//   Hộ gia đình 4.200 USD/tháng = 50.400 USD/năm
//   Trợ cấp cho người còn sống 2.800 USD/tháng
//   Nếu BẠN nhận ở tuổi 62: khoản của bạn còn 1.960 (giảm 840), trợ cấp
//     theo vợ/chồng vẫn ĐÚNG 1.400 — không đổi — hộ gia đình 3.360,
//     nhưng trợ cấp cho người còn sống giảm xuống 1.960, cũng giảm 840
//   Nếu VỢ/CHỒNG chờ đến 70: hồ sơ riêng của họ lên 1.116 nhưng vẫn thấp
//     hơn 1.400, nên hộ gia đình nhận thêm 0 — tám năm chờ đổi lấy 0
//   Nếu vợ/chồng nhận ở 62: trợ cấp theo vợ/chồng còn 910, hộ 3.710
//   Phép thử thu nhập, nhận ở 62 với 40.000 USD tiền lương: trợ cấp cả năm
//     23.520, vượt mức miễn trừ 16.600, bị giữ 8.300, thực nhận 15.220
//     = 1.268 USD/tháng, tức mất 35,3%
//   Mức miễn trừ năm 2025: 23.400 USD/năm dưới tuổi hưởng đủ và
//     62.160 USD/năm trong năm đạt tuổi hưởng đủ

export const US_SOCIAL_SECURITY_PAYOUT = {
  slug: "/cong-cu/chi-tra-an-sinh-xa-hoi",

  pageTitle: "Chi trả an sinh xã hội",
  metaTitle: "Chi trả an sinh xã hội — Hộ gia đình thực nhận bao nhiêu mỗi tháng",
  metaDescription:
    "Tính số tiền an sinh xã hội Hoa Kỳ hộ gia đình thực nhận mỗi tháng theo tuổi bắt đầu nhận của cả hai vợ chồng, gồm trợ cấp theo vợ/chồng và phần bị giữ lại khi còn làm việc. Công cụ miễn phí của FinHome.",

  lede:
    "Hai quy tắc quyết định phần lớn câu trả lời, và cả hai đều trái với trực giác: trợ cấp theo vợ/chồng tính trên mức cơ bản của người trụ cột chứ không tính trên khoản họ thực nhận, nên nhận sớm không làm giảm nó — còn trợ cấp cho người còn sống thì tính trên khoản thực nhận, nên nhận sớm làm giảm nó vĩnh viễn.",

  form: {
    workerGroup: "Bạn",
    piaLabel: "Mức trợ cấp cơ bản (PIA) của bạn",
    piaUnit: "USD/tháng",
    piaHelp:
      "Lấy từ tài khoản my Social Security của bạn — đó là khoản nhận ở đúng tuổi hưởng đủ. Nếu chưa có, hãy dùng trang ước tính an sinh xã hội trong bộ công cụ này trước.",
    birthYearLabel: "Năm sinh của bạn",
    birthYearHelp: "Quyết định tuổi hưởng đủ của bạn.",
    claimAgeLabel: "Tuổi bạn bắt đầu nhận",
    claimAgeUnit: "tuổi",
    claimAgeHelp: "Từ 62 đến 70.",

    spouseGroup: "Vợ hoặc chồng",
    spousePiaLabel: "Mức trợ cấp cơ bản của vợ/chồng",
    spousePiaUnit: "USD/tháng",
    spousePiaHelp:
      "Nhập 0 nếu họ không có hồ sơ riêng. Họ vẫn được nhận trợ cấp theo vợ/chồng.",
    spouseBirthYearLabel: "Năm sinh của vợ/chồng",
    spouseBirthYearHelp: "Quyết định tuổi hưởng đủ của họ.",
    spouseClaimAgeLabel: "Tuổi vợ/chồng bắt đầu nhận",
    spouseClaimAgeUnit: "tuổi",
    spouseClaimAgeHelp:
      "Chờ quá tuổi hưởng đủ KHÔNG làm tăng trợ cấp theo vợ/chồng — chỉ làm tăng khoản theo hồ sơ riêng của họ.",

    earningsGroup: "Nếu bạn còn làm việc",
    earningsLabel: "Tiền lương trong năm",
    earningsUnit: "USD",
    earningsHelp:
      "Chỉ tính thu nhập từ việc làm. Thu nhập từ đầu tư, lương hưu hay khoản rút tài khoản hưu trí không tính vào phép thử này. Nhập 0 nếu bạn đã nghỉ hẳn.",
    exemptUnderFraLabel: "Mức miễn trừ dưới tuổi hưởng đủ",
    exemptUnderFraUnit: "USD/năm",
    exemptUnderFraHelp:
      "Mức của năm 2025. Con số này được điều chỉnh hằng năm, nên hãy tra lại mức của năm bạn quan tâm rồi sửa ô này.",
    exemptFraYearLabel: "Mức miễn trừ trong năm đạt tuổi hưởng đủ",
    exemptFraYearUnit: "USD/năm",
    exemptFraYearHelp:
      "Mức của năm 2025, cao hơn nhiều và chỉ áp cho đúng năm bạn đạt tuổi hưởng đủ. Từ tháng đạt tuổi đó trở đi phép thử không còn áp dụng.",

    moneyInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    yearInvalid: "Vui lòng nhập một năm sinh từ 1900 đến 2100.",
    claimAgeInvalid: "Vui lòng nhập một tuổi nguyên từ 62 đến 70.",

    defaults: {
      pia: "2.800",
      birthYear: "1963",
      claimAge: "67",
      spousePia: "900",
      spouseBirthYear: "1965",
      spouseClaimAge: "67",
      earnings: "0",
      exemptUnderFra: "23.400",
      exemptFraYear: "62.160",
    },

    resultTitle: "Hộ gia đình nhận",
    householdMonthlyLabel: "Mỗi tháng",
    householdAnnualLabel: "Mỗi năm",
    workerMonthlyLabel: "Trong đó phần của bạn",
    spouseMonthlyLabel: "Phần của vợ/chồng",

    spouseTitle: "Vợ/chồng nhận theo hồ sơ nào",
    spouseOwnLabel: "Theo hồ sơ riêng của họ",
    spousalLabel: "Trợ cấp theo vợ/chồng, tối đa nửa PIA của bạn",
    spouseReceivesLabel: "Được trả theo mức cao hơn",
    survivorLabel: "Trợ cấp cho người còn sống",

    earningsTitle: "Phép thử thu nhập",
    exemptAppliedLabel: "Mức miễn trừ áp dụng",
    excessLabel: "Tiền lương vượt mức miễn trừ",
    withheldLabel: "Bị giữ lại trong năm",
    paidLabel: "Thực nhận trong năm",
    effectiveMonthlyLabel: "Tương đương mỗi tháng",

    ageTitle: "Mốc tuổi",
    yourFraLabel: "Tuổi hưởng đủ của bạn",
    spouseFraLabel: "Tuổi hưởng đủ của vợ/chồng",
    yourFactorLabel: "Hệ số của bạn so với mức cơ bản",
    monthsUnit: "tháng",
    yearsUnitShort: "tuổi",

    table: {
      caption: "Hộ gia đình nhận theo tuổi BẠN bắt đầu nhận",
      ageColumn: "Tuổi bạn nhận",
      workerColumn: "Bạn nhận",
      spousalColumn: "Vợ/chồng nhận",
      householdColumn: "Hộ gia đình",
      survivorColumn: "Người còn sống",
      intro:
        "Đọc ba cột cuối cùng lúc. Cột “vợ/chồng nhận” đứng yên suốt bảng, vì nó tính trên mức cơ bản của bạn chứ không trên khoản bạn thực nhận. Cột “người còn sống” thì đi lên cùng cột của bạn — đó là phần hệ quả của quyết định nhận sớm còn ở lại sau khi bạn không còn.",
    },

    exemptNotice:
      "Hai mức miễn trừ ở trên là mức của năm 2025 và được điều chỉnh hằng năm. Chúng là ô nhập được, nên nếu bạn đang tính cho một năm khác thì hãy tra mức của năm đó và sửa lại — công cụ không tự biết năm nào.",
    withheldNotice:
      "Một phần trợ cấp của bạn bị giữ lại vì tiền lương vượt mức miễn trừ. Phần bị giữ này KHÔNG mất hẳn: từ tuổi hưởng đủ, SSA tính lại khoản trợ cấp theo hướng tăng để hoàn lại số tháng đã bị giữ. Nhưng dòng tiền của những năm này thì đúng như con số ở trên, và với nhiều người đó mới là điều quan trọng.",
    spousalTopUpNotice:
      "Vợ/chồng bạn đang được trả theo trợ cấp theo vợ/chồng, không theo hồ sơ riêng. Điều đó có một hệ quả thực tế: mọi năm họ chờ thêm sau tuổi hưởng đủ đều không mang lại gì trên phần trợ cấp này. Nếu hồ sơ riêng của họ có thể vượt mức nửa PIA của bạn khi chờ đến 70, thì chờ mới có ý nghĩa — công cụ tính cả hai nên hãy thử đổi ô tuổi của họ.",
    ownRecordNotice:
      "Vợ/chồng bạn được trả theo hồ sơ riêng vì nó cao hơn trợ cấp theo vợ/chồng. Trong trường hợp này, mỗi năm họ chờ thêm sau tuổi hưởng đủ có tác dụng thật — cộng 8% một năm cho đến tuổi 70, đúng như với khoản của bạn.",
    invalidNotice:
      "Một ô nhập chưa hợp lệ. Tuổi bắt đầu nhận của cả hai người phải nằm trong khoảng 62 đến 70.",
  },

  asymmetryNotice:
    "Với các giá trị mặc định, hộ gia đình nhận 4.200 USD một tháng. Hãy thử đổi tuổi bạn bắt đầu nhận từ 67 xuống 62: khoản của bạn giảm từ 2.800 xuống 1.960 USD — và trợ cấp theo vợ/chồng vẫn ĐÚNG 1.400 USD, không giảm một xu, vì nó tính trên mức cơ bản của bạn chứ không trên khoản bạn thực nhận. Nhưng trợ cấp cho người còn sống thì giảm từ 2.800 xuống 1.960, và nó giảm vĩnh viễn: nếu bạn mất trước, người còn lại sống với con số thấp hơn đó suốt phần đời còn lại. Ở chiều ngược lại, nếu vợ/chồng bạn chờ từ 67 đến 70 thì hồ sơ riêng của họ tăng từ 900 lên 1.116 USD — vẫn dưới mức 1.400 của trợ cấp theo vợ/chồng, nên hộ gia đình nhận thêm đúng 0 đồng cho ba năm chờ đó.",

  formula: {
    title: "Cách tính",
    body: [
      "Trang này KHÔNG tính mức trợ cấp cơ bản của bạn — nó nhận con số đó làm đầu vào. Lý do là con số tốt nhất luôn là con số trong tài khoản my Social Security của bạn, tính từ lịch sử thu nhập thật. Nhờ vậy trang này cũng không cần đến các mốc của công thức, thứ được điều chỉnh hằng năm.",
      "Khoản của mỗi người tính từ mức cơ bản của chính họ, điều chỉnh theo tuổi họ bắt đầu nhận: giảm 5/9 của 1% mỗi tháng cho 36 tháng đầu trước tuổi hưởng đủ, 5/12 của 1% cho các tháng xa hơn, và cộng 2/3 của 1% mỗi tháng nếu nhận sau tuổi hưởng đủ, dừng ở tuổi 70.",
      "Trợ cấp theo vợ/chồng tối đa bằng nửa MỨC CƠ BẢN của người trụ cột, và chỉ điều chỉnh theo tuổi của người NHẬN nó. Hai điều theo sau, và cả hai đều hay bị hiểu sai: người trụ cột nhận sớm không làm giảm trợ cấp theo vợ/chồng, và trợ cấp theo vợ/chồng không có phần cộng thêm cho việc chờ sau tuổi hưởng đủ. Mức giảm khi nhận sớm cũng theo một thang khác — 25/36 của 1% mỗi tháng cho 36 tháng đầu — nên ở tuổi 62 với tuổi hưởng đủ 67, nó bằng 32,5% mức cơ bản của người trụ cột chứ không phải 50%.",
      "Người nhận trợ cấp theo vợ/chồng không nhận cả hai khoản. Họ nhận khoản CAO HƠN giữa hồ sơ riêng và trợ cấp theo vợ/chồng — trên thực tế SSA trả khoản riêng trước rồi cộng phần bù cho bằng, nhưng tổng số là như nhau và công cụ hiển thị theo cách dễ đọc hơn.",
      "Trợ cấp cho người còn sống thì tính trên khoản THỰC NHẬN của người đã mất, không phải trên mức cơ bản. Đó là bất đối xứng quan trọng nhất trên trang: nhận sớm không ảnh hưởng trợ cấp theo vợ/chồng nhưng làm giảm trợ cấp cho người còn sống, và phần giảm đó kéo dài suốt cuộc đời người còn lại. Với các cặp vợ chồng có mức thu nhập lệch nhau nhiều, đây thường là lý do mạnh nhất để người thu nhập cao hơn chờ.",
      "Phép thử thu nhập giữ lại 1 USD cho mỗi 2 USD tiền lương vượt mức miễn trừ, hoặc mỗi 3 USD trong năm bạn đạt tuổi hưởng đủ. Từ tuổi đó trở đi phép thử dừng hẳn. Phần bị giữ không mất hẳn — trợ cấp được tính lại theo hướng tăng ở tuổi hưởng đủ — nhưng dòng tiền của những năm bị giữ thì đúng như con số hiển thị.",
      "Công cụ đơn giản hóa vài chỗ và nói rõ ở đây: trợ cấp cho người còn sống hiển thị theo trường hợp nhận từ tuổi hưởng đủ trở đi (nhận sớm hơn, có thể từ tuổi 60, sẽ bị giảm theo một thang riêng); không tính điều chỉnh theo giá sinh hoạt; không tính thuế trên trợ cấp; và không mô hình hóa trợ cấp cho con hoặc mức trần tổng trợ cấp của một hồ sơ gia đình.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Tôi nhận sớm thì vợ/chồng tôi có bị giảm theo không?",
        a: "Trợ cấp theo vợ/chồng thì không, trợ cấp cho người còn sống thì có. Đây là hai khoản khác nhau và chúng theo hai quy tắc khác nhau. Trợ cấp theo vợ/chồng tính trên mức cơ bản của bạn, nên với các giá trị mặc định nó là 1.400 USD dù bạn nhận ở 62 hay ở 70. Trợ cấp cho người còn sống tính trên khoản bạn thực nhận, nên nó đi từ 1.960 USD nếu bạn nhận ở 62 lên 2.800 USD nếu bạn nhận ở tuổi hưởng đủ. Nếu vợ/chồng bạn có khả năng sống lâu hơn bạn và hồ sơ riêng của họ thấp hơn bạn, thì con số thứ hai mới là con số quan trọng nhất trong quyết định của bạn.",
      },
      {
        q: "Vợ/chồng tôi có nên chờ đến 70 không?",
        a: "Chỉ khi hồ sơ riêng của họ có thể vượt mức nửa PIA của bạn. Với các giá trị mặc định, hồ sơ riêng của họ là 900 USD; chờ đến 70 nâng nó lên 1.116 USD, vẫn dưới mức 1.400 USD của trợ cấp theo vợ/chồng — nên hộ gia đình không nhận thêm đồng nào cho ba năm chờ. Ngưỡng để việc chờ có ý nghĩa là: hồ sơ riêng của họ ở tuổi hưởng đủ phải trên khoảng 40% mức cơ bản của bạn, vì 1,24 lần con số đó mới vượt được mức 50%. Hãy nhập số thật của cả hai người và thử đổi ô tuổi.",
      },
      {
        q: "Vì sao trợ cấp theo vợ/chồng ở tuổi 62 chỉ là 32,5% chứ không phải 50%?",
        a: "Vì mức 50% là mức ở tuổi hưởng đủ, và nhận sớm bị giảm theo một thang riêng cho trợ cấp theo vợ/chồng: 25/36 của 1% mỗi tháng cho 36 tháng đầu, rồi 5/12 của 1% cho các tháng xa hơn. Với tuổi hưởng đủ 67, nhận ở 62 là 60 tháng sớm, tức giảm 35%, và 50% nhân 65% là 32,5%. Đó cũng là lý do trên trang có cả ô tuổi riêng cho vợ/chồng: hai người có thể chọn hai tuổi khác nhau, và với nhiều cặp thì phương án tốt là người có mức cơ bản cao hơn chờ lâu nhất có thể còn người kia nhận sớm.",
      },
      {
        q: "Tiền bị giữ lại vì còn làm việc có mất luôn không?",
        a: "Không. Từ tuổi hưởng đủ, SSA tính lại khoản trợ cấp của bạn theo hướng tăng để bù cho số tháng đã bị giữ, nên xét cả đời thì phần lớn hoặc toàn bộ được trả lại. Nhưng có hai điều đáng lưu ý. Thứ nhất là dòng tiền: với các giá trị mặc định, nhận ở tuổi 62 với 40.000 USD tiền lương làm khoản trợ cấp cả năm rơi từ 23.520 xuống 15.220 USD — mất 35,3% trong đúng những năm bạn cần nó. Thứ hai, chỉ TIỀN LƯƠNG bị tính; khoản rút tài khoản hưu trí, lương hưu, cổ tức và tiền cho thuê đều không bị tính vào phép thử này.",
      },
      {
        q: "Vì sao trang này bắt tôi tự nhập mức trợ cấp cơ bản?",
        a: "Vì con số đó nên đến từ SSA chứ không từ chúng tôi. Nó được tính từ lịch sử thu nhập thật theo từng năm của bạn, thứ mà không công cụ nào bên ngoài SSA có. Việc nhận nó làm đầu vào cũng có một lợi ích khác: trang này không cần đến các mốc của công thức trợ cấp, những con số được điều chỉnh hằng năm và chỉ có số liệu công bố cho một vài năm — nên kết quả ở đây không bị cũ đi theo năm. Nếu bạn chưa có con số của SSA, trang ước tính an sinh xã hội trong bộ công cụ này dựng một con số gần đúng từ thu nhập bình quân của bạn.",
      },
    ],
  },
} as const;
