import { NextRequest, NextResponse } from 'next/server';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

export async function POST(request: NextRequest) {
  try {
    const { data, keyword } = await request.json();

    if (!data || !Array.isArray(data)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: `SEO Research Report: ${keyword}`,
            heading: HeadingLevel.TITLE,
          }),
          new Paragraph({
            text: `Generated on: ${new Date().toLocaleDateString()}`,
            spacing: { after: 400 },
          }),
          
          // Summary section
          new Paragraph({
            text: "Executive Summary",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `This report analyzes ${data.length} websites for the keyword "${keyword}". `,
              }),
              new TextRun({
                text: `The analysis includes metadata extraction, keyword density analysis, and schema markup evaluation.`,
              }),
            ],
            spacing: { after: 400 },
          }),

          // Individual site analysis
          new Paragraph({
            text: "Website Analysis",
            heading: HeadingLevel.HEADING_1,
          }),
          
          ...data.flatMap((site: any, index: number) => [
            new Paragraph({
              text: `${index + 1}. ${site.title}`,
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
              text: `URL: ${site.url}`,
              spacing: { after: 200 },
            }),
            
            // Metadata section
            new Paragraph({
              text: "Metadata",
              heading: HeadingLevel.HEADING_3,
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Title: ", bold: true }),
                new TextRun({ text: site.title || 'N/A' }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Description: ", bold: true }),
                new TextRun({ text: site.metadata?.description || 'N/A' }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Keywords: ", bold: true }),
                new TextRun({ text: site.metadata?.keywords || 'N/A' }),
              ],
              spacing: { after: 200 },
            }),
            
            // H1 Tags
            new Paragraph({
              text: "H1 Tags",
              heading: HeadingLevel.HEADING_3,
            }),
            ...(site.metadata?.h1Tags || []).map((h1: string) => 
              new Paragraph({
                children: [
                  new TextRun({ text: "• " }),
                  new TextRun({ text: h1 }),
                ],
              })
            ),
            
            // Keyword Analysis
            new Paragraph({
              text: "Keyword Analysis",
              heading: HeadingLevel.HEADING_3,
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Keyword Density: ", bold: true }),
                new TextRun({ text: `${site.keywordAnalysis?.density?.toFixed(2) || 0}%` }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Keyword Count: ", bold: true }),
                new TextRun({ text: `${site.keywordAnalysis?.count || 0}` }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Total Words: ", bold: true }),
                new TextRun({ text: `${site.keywordAnalysis?.totalWords || 0}` }),
              ],
              spacing: { after: 200 },
            }),
            
            // Schema Data
            new Paragraph({
              text: "Schema Markup",
              heading: HeadingLevel.HEADING_3,
            }),
            new Paragraph({
              text: site.schema?.length ? `Found ${site.schema.length} schema objects` : 'No schema markup found',
              spacing: { after: 400 },
            }),
          ]),
          
          // Consolidated Analysis
          new Paragraph({
            text: "Consolidated Analysis",
            heading: HeadingLevel.HEADING_1,
          }),
          
          // All H1 tags
          new Paragraph({
            text: "All H1 Tags",
            heading: HeadingLevel.HEADING_2,
          }),
          ...data.flatMap((site: any) => 
            (site.metadata?.h1Tags || []).map((h1: string) => 
              new Paragraph({
                children: [
                  new TextRun({ text: "• " }),
                  new TextRun({ text: h1 }),
                  new TextRun({ text: ` (${site.title})`, italics: true }),
                ],
              })
            )
          ),
          
          // Keyword density comparison
          new Paragraph({
            text: "Keyword Density Comparison",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400 },
          }),
          ...data.map((site: any) => 
            new Paragraph({
              children: [
                new TextRun({ text: `${site.title}: `, bold: true }),
                new TextRun({ text: `${site.keywordAnalysis?.density?.toFixed(2) || 0}%` }),
              ],
            })
          ),
        ],
      }],
    });

    const buffer = await Packer.toBuffer(doc);
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="seo-research-${keyword.replace(/[^a-zA-Z0-9]/g, '-')}.docx"`,
      },
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate document', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}