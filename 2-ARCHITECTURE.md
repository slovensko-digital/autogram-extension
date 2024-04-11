<link
  href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
  rel="stylesheet"
/>
# Planned Architecture

## D.Signer

```mermaid
---
title: Simplified D.Signer Flow
---
sequenceDiagram
    Web (UPVS/FS) ->> D.Bridge: Call method
    D.Bridge ->> D.Signer: Start
    activate D.Signer
    D.Bridge -) D.Signer: Add File
    D.Bridge -) D.Signer: Sign
    D.Bridge -) D.Signer: Get Signed data
    deactivate D.Signer
    D.Bridge ->> Web (UPVS/FS): Return signed data
```

## D.Signer with Extension

```mermaid
---
title: Simplified D.Signer Flow with Extension
---
sequenceDiagram
    Web (UPVS/FS) ->> D.Bridge: Call method
    D.Bridge ->> Extension: Call method
    activate Extension
    Extension ->> Autogram: Start
    Autogram ->> D.Signer: Start
    activate D.Signer
    Autogram -) D.Signer: Add File
    Autogram -) D.Signer: Sign
    Autogram -) D.Signer: Get Signed data
    deactivate D.Signer
    Autogram ->> Extension: Return signed data
    Extension ->> D.Bridge: Return signed data
    D.Bridge ->> Web (UPVS/FS): Return signed data
```

## Extension Architecture

```mermaid
---
title: Architecture
---
classDiagram

class ditec["ditec object"] 

ditec -- ditecX

namespace SourceSigner {
    class ditecX
    class DBridgeImpl
    class DSigXadesAdapter
    class DSigXadesBpAdapter
    class DSigAdapter
}

    DSigAdapter --> DBridgeImpl


namespace TargetSigner {
    class DBridgeAutogramImpl
    class DBridgeAutogramVMImpl
    class DBridgePodpisujImpl
}
    class ditecX{
        +config
        +DSigXadesAdapter dSigXadesJs
        +DSigXadesBpAdapter dSigXadesBpJs
    }

    ditecX --> DSigXadesAdapter
    ditecX --> DSigXadesBpAdapter


    class DSigAdapter {
        <<Interface>>
        -DBridgeImpl __implementation
        +initialize()
        +sign()
        +setLanguage(*)
        +detectSupportedPlatforms()
    }

    

    class DBridgeImpl {
        +initialize()
        +addFile()
        +sign()
        +getSignedData()
    }

    DBridgeImpl <|-- DBridgeAutogramImpl: implements
    DBridgeImpl <|-- DBridgeAutogramVMImpl: implements
    DBridgeImpl <|-- DBridgePodpisujImpl: implements
    DSigAdapter <|-- DSigXadesAdapter: extends
    DSigAdapter <|-- DSigXadesBpAdapter: extends

    class DSigXadesAdapter {
        +addXmlObject()
        +addXmlObject2()
        +addPdfObject()
        +addTxtObject()
        +addPngObject()
        +sign11()
        +sign20()
    }


    class DSigXadesBpAdapter {
        +addXmlObject()
        +addXmlObject2()
        +addPdfObject()
        +addTxtObject()
        +addPngObject()
        +getSignatureWithASiCEnvelopeBase64()
        +deploy()
        +getConvertedPDFA()
    }



```

## Flow Of Action

```mermaid
---
title: Autogram Extension Flow
---
flowchart LR
    Web{{"Web (UPVS,FS,..)"}} --> D.Bridge
    D.Bridge["D.Bridge (proxied)"] --> D.BridgeAdapter
    subgraph Extension
    D.BridgeAdapter --> ActionLog[(ActionLog)]
    ActionLog --> SignerAdapter
    end

    subgraph Signer
    SignerAdapter <--> SignerAPI
    end

```

