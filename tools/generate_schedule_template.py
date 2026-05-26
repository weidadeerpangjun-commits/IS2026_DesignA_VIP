#!/usr/bin/env python3
"""
Generate ../templates/SI-Schedule-Data-Template.xlsx (Office Open XML).
Requires: Python 3.6+ (stdlib only).
Run: python3 tools/generate_schedule_template.py
"""
from __future__ import annotations

import zipfile
from pathlib import Path
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "templates"
OUT_PATH = OUT_DIR / "SI-Schedule-Data-Template.xlsx"


def esc(s: str) -> str:
    return escape(s, {"\n": "&#10;"})


def col_letter(n: int) -> str:
    s = ""
    while n:
        n, r = divmod(n - 1, 26)
        s = chr(65 + r) + s
    return s


def sheet_xml(rows: list[list[str]], name: str) -> str:
    """rows: list of list of cell strings (UTF-8)."""
    parts = [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">',
        "<sheetData>",
    ]
    for ri, row in enumerate(rows, start=1):
        parts.append(f'<row r="{ri}">')
        for ci, val in enumerate(row, start=1):
            ref = f"{col_letter(ci)}{ri}"
            if val == "":
                parts.append(f'<c r="{ref}"/>')
            else:
                parts.append(
                    f'<c r="{ref}" t="inlineStr"><is><t xml:space="preserve">{esc(val)}</t></is></c>'
                )
        parts.append("</row>")
    parts.append("</sheetData></worksheet>")
    return "".join(parts)


def main() -> None:
    instructions_zh = [
        ["Summer Institute 日程数据 — Excel 填写说明", ""],
        ["", ""],
        ["1. 工作表「Sessions」每一行 = 一个参训分组下、某一天的一场活动。", ""],
        ["2. scope：分组 ID（V1 / V2 / V3），须与网站一致。", ""],
        ["3. day_id：d1=8月3日 … d5=8月7日（V1 日程可填 d1–d5；首页参训展示为 8/5–7。V3 为 d2–d5）。", ""],
        ["4. sort_order：同一天内从小到大排序。", ""],
        [
            "5. group_tsv_zh / en：与录入页相同，从 Excel 复制表（首行表头，Tab 分列）粘贴到单元格。",
            "",
        ],
        ["6. detail 多行用换行（Alt+Enter）。", ""],
        ["7. 勿改列名；完成后交给技术导入 JSON。", ""],
        ["scope 取值", "说明"],
        ["v1", "V1 · 首页参训 8/5–7；日程键可填 d1–d5"],
        ["v2", "V2 · 8/3–7（日程键 d1–d5）"],
        ["v3", "V3 · 8/4–7（日程键 d2–d5）"],
        ["day_id", "日期(2026)"],
        ["d1", "8月3日"],
        ["d2", "8月4日"],
        ["d3", "8月5日"],
        ["d4", "8月6日"],
        ["d5", "8月7日"],
    ]

    instructions_en = [
        ["Summer Institute — Excel template (instructions)", ""],
        ["", ""],
        ["1. Sheet «Sessions»: one row = one session (scope + day).", ""],
        ["2. scope: must match site IDs.", ""],
        ["3. day_id: d1 = Aug 3 … d5 = Aug 7 (V1 schedule rows may use d1–d5; home scope shows Aug 5–7 attendance. V3 uses d2–d5).", ""],
        ["4. sort_order: ascending within scope+day.", ""],
        ["5. group_tsv_*: paste TSV from Excel into one cell if needed.", ""],
        ["6. detail_*: line breaks between lines.", ""],
        ["7. Do not rename columns.", ""],
        ["scope", "description"],
        ["v1", "V1 · Aug 5–7 on home; schedule day keys d1–d5"],
        ["v2", "V2 · Aug 3–7 (day keys d1–d5)"],
        ["v3", "V3 · Aug 4–7 (day keys d2–d5)"],
        ["day_id", "2026"],
        ["d1", "Aug 3"],
        ["d2", "Aug 4"],
        ["d3", "Aug 5"],
        ["d4", "Aug 6"],
        ["d5", "Aug 7"],
    ]

    headers = [
        "scope",
        "day_id",
        "sort_order",
        "time_zh",
        "time_en",
        "topic_zh",
        "topic_en",
        "intro_zh",
        "intro_en",
        "loc_zh",
        "loc_en",
        "detail_zh",
        "detail_en",
        "group_tsv_zh",
        "group_tsv_en",
    ]

    examples = [
        [
            "v1",
            "d1",
            "1",
            "08:30 - 10:30",
            "08:30 - 10:30",
            "开幕致辞 · BASIS 使命与治理",
            "Opening Speech · BASIS Mission and Governance",
            "全体",
            "For All",
            "礼堂 318",
            "Auditorium, 318",
            "",
            "",
            "",
            "",
        ],
        [
            "v1",
            "d1",
            "2",
            "10:30 - 11:00",
            "10:30 - 11:00",
            "茶歇",
            "Break",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
        ],
        [
            "v1",
            "d3",
            "1",
            "全天",
            "All day",
            "示例：全天活动",
            "Example: all-day session",
            "",
            "",
            "",
            "",
            "第一行详情\n第二行详情",
            "Detail line 1\nDetail line 2",
            "",
            "",
        ],
    ]

    sheets = [
        ("说明-zh", instructions_zh),
        ("README-en", instructions_en),
        ("Sessions", [headers] + examples),
    ]

    sheet_xmls = [(name, sheet_xml(rows, name)) for name, rows in sheets]

    content_types = """<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
"""
    for i in range(1, len(sheets) + 1):
        content_types += f'<Override PartName="/xl/worksheets/sheet{i}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>\n'
    content_types += """<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>
"""

    rels = """<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>
"""

    wb_rels_parts = []
    for i in range(1, len(sheets) + 1):
        wb_rels_parts.append(
            f'<Relationship Id="rId{i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet{i}.xml"/>'
        )
    wb_rels = (
        """<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
"""
        + "\n".join(wb_rels_parts)
        + """
<Relationship Id="rId99" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>
"""
    )

    sheets_el = "".join(
        f'<sheet name="{esc(name)}" sheetId="{i}" r:id="rId{i}"/>' for i, (name, _) in enumerate(sheets, start=1)
    )
    workbook = f"""<?xml version="1.0" encoding="UTF-8"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets>{sheets_el}</sheets>
</workbook>
"""

    styles = """<?xml version="1.0" encoding="UTF-8"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="1"><font><sz val="11"/><color theme="1"/><name val="Calibri"/></font></fonts>
<fills count="1"><fill><patternFill patternType="none"/></fill></fills>
<borders count="1"><border/></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="1"><xf xfId="0" fontId="0" fillId="0" borderId="0" numFmtId="0"/></cellXfs>
</styleSheet>
"""

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(OUT_PATH, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", content_types)
        z.writestr("_rels/.rels", rels)
        z.writestr("xl/workbook.xml", workbook)
        z.writestr("xl/_rels/workbook.xml.rels", wb_rels)
        z.writestr("xl/styles.xml", styles)
        for i, (_, xml) in enumerate(sheet_xmls, start=1):
            z.writestr(f"xl/worksheets/sheet{i}.xml", xml)

    print("Wrote", OUT_PATH)


if __name__ == "__main__":
    main()
